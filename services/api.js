const _ = require('underscore')
const shortid = require('shortid')
var spawn = require('child_process').spawn

var passport = require('passport');
const path = require('path')

var fs = require("fs");
var rp = require('request-promise');
rp = rp.defaults({json: true});

const Faye = require('faye')
const config = require('../config')
var client = new Faye.Client(config.SERVERS.MQ_SERVER)

var HOST = 'http://127.0.0.1:' + config.SERVERS.WEB_SERVER_PORT

function getAreas() {
    return rp({uri: HOST + '/areas'})
}

function getWrapper() {
    return rp({uri: HOST + '/wrapper'})
}

function getUwb() {
    return rp({uri: HOST + '/uwb'})
}

function getRtk() {
    return rp({uri: HOST + '/rtk'})
}

function getNodes() {
    return rp({uri: HOST + '/nodes'})
}

function delStation(node_id) {
    var options = {
        method: 'DELETE',
        uri: HOST + '/nodes/' + node_id,
    };
    return rp(options)
}

function addStation(body) {
    var options = {
        method: 'POST',
        uri: HOST + '/nodes',
        body: body,
    };
    return rp(options)
}

function addArea(body) {
    var options = {
        method: 'POST',
        uri: HOST + '/areas',
        body: body,
    };
    return rp(options)
}

function getWrapperConfig() {
    return Promise.all([
        getAreas(),
        getWrapper(),
        getUwb(),
        getRtk(),
        getNodes(),
    ]).then(function (results) {
        var zone = results[0],
            wrapper = results[1],
            uwb = results[2],
            rtk = results[3],
            nodes = results[4],
            uwb_nodes = _.where(nodes, {'nodeType': 2}),
            rtk_nodes = _.where(nodes, {'nodeType': 1})

        uwb['base.conf'] = uwb_nodes
        rtk['base.conf'] = rtk_nodes
        wrapper['uwb_bases'] = _.pluck(uwb_nodes, 'nodeID')
        wrapper['rtk_bases'] = _.pluck(rtk_nodes, 'nodeID')

        return Promise.resolve({
            zone: zone,
            wrapper: wrapper,
            UWB: uwb,
            RTK: rtk,
            nodes: nodes
        })
    })
}

var elasticsearch = require('elasticsearch');
var elasticsearChlient = new elasticsearch.Client({
    host: '192.168.1.17:9200'
    // log: 'trace'
});

var child_process = require('child_process');

var stationHistoryInfo = [];
var labelHistoryInfo = [];
var stationNum = 0;
var stationLastOne = 0;
var labelNum = 0;
var labelLastOne = 0;

var allDataObj = {};
var lastDataArr = [];

function getTimeDifference(start, end, allDataObj, fileName) {
    var startTime = getTime(start);
    var endTime = getTime(end);
    var timeDifference = endTime - startTime;
    console.log(timeDifference);
    getLastData(startTime, endTime, timeDifference, allDataObj, fileName)
}


function getLastData(startTime, endTime, timeDifference, allDataObj, fileName) {
    console.log('=====================time');
    if (Object.keys(allDataObj).length == 0) {
        return fs.writeFileSync(path.join(__dirname, '../public/data/' + fileName), '[]')
    }
    for (var i = 0; i < timeDifference; i++) {
        var obj = {};
        for (var j in allDataObj) {
            if (j in obj == true) {
                getOneSecondData(obj, j, i, startTime, endTime, allDataObj);
            } else {
                obj[j] = [];
                getOneSecondData(obj, j, i, startTime, endTime, allDataObj);
            }
        }
        lastDataArr.push(obj);
    }
    saveDataArr(fileName);
    // console.log(lastDataArr[0]);   // 这里得到基本的数据。（不包含节点信息的数据。）
}

function getOneSecondData(obj, name, i, startTime, endTime, allDataObj) {
    for (var z = 0; z < allDataObj[name].length; z++) {
        var timeData = getTime(allDataObj[name][z].timestamp);
        if (startTime + i <= timeData && timeData < startTime + i + 1 && startTime <= timeData && timeData <= endTime) {
            obj.timestamp = allDataObj[name][z].timestamp;
            obj[name].push(allDataObj[name][z])
        }
    }
}

function saveDataArr(fileName) {
    fs.writeFile(path.join(__dirname, '../public/data/' + fileName), JSON.stringify(lastDataArr), function (err) {
        // res.sendFile(path.join(__dirname, '../public/data/result.txt'))
        console.log('--保存文件结束！！！')
        lastDataArr.length = 0;
    });
}

function getTime(timeStamp) {
    return parseInt(timeStamp / 1000)
}

function getHistoryInfo(start, end, fileName) {
    elasticsearChlient.search({
        index: 'bigship',
        type: 'history',
        body: {
            query: {
                range: {timestamp: {gte: start, lte: end}}
            }, size: 10000
        }
    }).then(function (resp) {
        var data = resp.hits.hits;
        var allDataObj = {};
        for (var j = 0; j < data.length; j++) {
            if (!allDataObj.hasOwnProperty(data[j]._source.eventName)) {
                allDataObj[data[j]._source.eventName] = [];
            }
        }
        for (var i = 0; i < data.length; i++) {
            allDataObj[data[i]._source.eventName].push(data[i]._source)
        }

        getTimeDifference(start, end, allDataObj, fileName)
    }, function (err) {
        console.trace(err.message);
    });
}

module.exports = function (app) {
    app.post('/login', function (req, res, next) {
        passport.authenticate('local', function (err, user) {
            if (err) return next(err);
            console.log(user)
            if (!user) {
                return res.send(user);
            }
            console.log(req.isAuthenticated())
            req.logIn(user, function (err) {
                if (err) return next(err);
                console.log(req.isAuthenticated())
                return res.send(user);
            })
        })(req, res, next);
    })

    app.get('/logout', function (req, res) {
        req.session.destroy();
        req.logout();
        res.send('logout')
    })

    app.get('/isLogin', function (req, res) {
        console.log(req.isAuthenticated())
        if (!req.isAuthenticated()) {
            return res.send({bool: false})
        } else {
            return res.send({bool: true, user: req.user})
        }
    })

    app.get('/isAuthenticated', function () {
        return function (req, res, next) {
            if (req.isAuthenticated()) {
                next()
            } else {
                return res.send({bool: false});
            }
        }
    })

    app.get('/getAllHistoryInfo', function (req, res) {
        res.send({
            label: [[{
                "nodeID": 1,
                "beforeUpdateInfo": null,
                "afterUpdateInfo": {
                    "name": 1, "type": "UWB",
                    "nodeID": 1
                },
                "updateDate": 1507882790205
            }],
                [{
                    "nodeID": 2,
                    "beforeUpdateInfo": null,
                    "afterUpdateInfo": {
                        "name": 2, "type": "UWB", "nodeID": 2
                    },
                    "updateDate": 1507882700205
                }, {
                    "nodeID": 2,
                    "beforeUpdateInfo": {
                        "name": 2, "type": "UWB", "nodeID": 2
                    },
                    "afterUpdateInfo": {
                        "name": 21, "type": "UWB", "nodeID": 2
                    },
                    "updateDate": 1507882899205
                }, {
                    "nodeID": 2,
                    "beforeUpdateInfo": {
                        "name": 21, "type": "UWB", "nodeID": 2
                    },
                    "afterUpdateInfo": {
                        "name": 22, "type": "UWB", "nodeID": 2
                    },
                    "updateDate": 1507882999205
                }]
                , [{
                    "nodeID": 3,
                    "beforeUpdateInfo": null,
                    "afterUpdateInfo": {
                        "name": 3, "type": "UWB", "nodeID": 3
                    },
                    "updateDate": 1507882700205
                }, {
                    "nodeID": 3,
                    "beforeUpdateInfo": null,
                    "afterUpdateInfo": {
                        "name": 31, "type": "UWB", "nodeID": 3
                    },
                    "updateDate": 1507882899205
                }]],
            station: [[{
                "nodeID": 4,
                "beforeUpdateInfo": null,
                "afterUpdateInfo": {
                    "name": 4, "type": "UWB", "z": 999, "y": 999, "x": 999,
                    "nodeID": 4
                },
                "updateDate": 1507882790205
            }],
                [{
                    "nodeID": 5,
                    "beforeUpdateInfo": null,
                    "afterUpdateInfo": {
                        "name": 5, "type": "UWB", "nodeID": 5, "z": 0, "y": 0, "x": 0
                    },
                    "updateDate": 1507882700205
                }, {
                    "nodeID": 5,
                    "beforeUpdateInfo": {
                        "name": 5, "type": "UWB", "nodeID": 5, "z": 0, "y": 0, "x": 0
                    },
                    "afterUpdateInfo": {
                        "name": 51, "type": "UWB", "nodeID": 5, "z": 1, "y": 1, "x": 1
                    },
                    "updateDate": 1507882899205
                }, {
                    "nodeID": 5,
                    "beforeUpdateInfo": {
                        "name": 51, "type": "UWB", "nodeID": 5, "z": 1, "y": 1, "x": 1
                    },
                    "afterUpdateInfo": {
                        "name": 52, "type": "UWB", "nodeID": 5, "z": 2, "y": 2, "x": 2
                    },
                    "updateDate": 1507882999205
                }]]
        })
    })

    app.get('/createHistoryData', function (req, res) {
        var timeDifference = getTime(req.query.endTime) - getTime(req.query.startTime);
        console.log(timeDifference);
        var fileName = new Date().getTime() + '.json';
        try {
            getHistoryInfo(req.query.startTime, req.query.endTime, fileName);
            res.send({status: true, fileName: fileName})
        } catch (err) {
            getHistoryInfo(req.query.startTime, req.query.endTime, fileName);
            res.send({status: true, fileName: fileName})
        }
    }) // 1507882700205,1507882899205

    app.get('/getHistoryDataFile', function (req, res) {
        fs.exists(path.join(__dirname, '../public/data/' + req.query.fileName), function (exists) {
            console.log(path.join(__dirname, '../public/data/' + req.query.fileName))
            console.log("文件是否存在:" + exists);
            if (exists) {
                res.sendFile(path.join(__dirname, '../public/data/' + req.query.fileName))
            } else {
                res.send(false)
            }
        });
    })

    // app.post('/nodes/wrapper', function (req, res) {
    //     // TODO get config info
    //     rp({
    //         uri: 'http://127.0.0.1:9000/getConfigInfo',
    //         json: true
    //     }).then(function (repos) {
    //         console.log('User has %d repos', repos.length);
    //
    //         client.publish('/worker/cmd', {
    //             'op': 'start',
    //             'worker_id': 'wrapper',
    //             'task_id': new Date().getTime(),
    //             'config': repos
    //         })
    //
    //     }).catch(function (err) {
    //     });
    //
    //     // TODO publish the config to wrapper_daemon
    //
    //     res.send('POST request to the homepage');
    // });

    // app.post('/addArea', function (req, res) {
    //
    //     addArea(_.extend(req.body, {id: shortid.generate()}))
    //         .then(function (data) {
    //             res.send(data)
    //         })
    // })
    //
    // app.get('/getAllArea', function (req, res) {
    //     rp({uri: HOST + '/areas'})
    //         .then(function (data) {
    //             res.send(data)
    //         })
    //     // getNodes()
    //     //     .then(function (nodes) {
    //     //         var stations = _.filter(nodes, function (node) {
    //     //             return (node.nodeType == 1 || node.nodeType == 2);
    //     //         })
    //     //         res.send(stations)
    //     //     })
    //
    // })
    //
    // app.get('/getAllStationInfo', function (req, res) {
    //     rp({uri: HOST + '/nodes?nodeType=1&nodeType=2'})
    //         .then(function (data) {
    //             res.send(data)
    //         })
    // })
    // app.get('/getAllLabelInfo', function (req, res) {
    //     rp({uri: HOST + '/nodes?nodeType=3'})
    //         .then(function (data) {
    //             res.send(data)
    //         })
    // })
    //
    // app.get('/getStationInfo', function (req, res) {
    //     console.log(req.query['nodeType'])
    //     rp({uri: HOST + '/nodes?nodeType=' + req.query['nodeType']})
    //         .then(function (data) {
    //             res.send(data)
    //         })
    // })
    //

    var wrapper_thread = undefined

    process.on('SIGINT', function () {
        if (wrapper_thread) {
            wrapper_thread.kill()
        }
        require('child_process').exec('taskkill /F /IM ServiceUWBLib.exe')
        require('child_process').exec('taskkill /F /IM ServiceRTKLib.exe')
        setTimeout(function () {
            process.exit(0)
        }, 1000)
    })

    function startWrapper(config_file) {
        return new Promise(function (resolve, reject) {
            if (wrapper_thread) {
                wrapper_thread.kill()
                wrapper_thread = undefined
            }
            setTimeout(function () {
                wrapper_thread = spawn(config.WRAPPER_CORE_EXE, [config_file])
                wrapper_thread.on('exit', function () {
                    console.log('wrapper has exited')
                })
                wrapper_thread.stderr.on('data', function (data) {
                    console.error(data)
                })
                resolve(wrapper_thread)
            }, 1000)
        })
    }

    app.get('/wrapper/restart', function (req, res) {
        console.log('restart')
        getWrapperConfig()
            .then(function (data) {
                var config_file = path.join(config.DIR.CONFIG_DIR, 'wrapper_' + new Date().getTime() + '.json')
                fs.writeFileSync(
                    config_file,
                    JSON.stringify(data)
                )
                return startWrapper(config_file)
            })
            .then(function (pid) {
                res.send('ok')
            }, function (err) {
                res.send(500, err)
            })
    })
    //
    // // TODO Station
    // app.post('/deleteStation', function (req, res) {
    //     var station_id = req.body.nodeID
    //     delStation(station_id)
    //         .then(function (data) {
    //             res.send(data)
    //         }, function (err) {
    //             res.status(500).send(err)
    //         })
    // })
    //
    // app.post('/areas', (req, res, next) => {
    //     console.log('post areas')
    //     next()
    // })


    // app.post('/addStation', function (req, res) {
    //     var station = _.chain(req.body)
    //         .clone()
    //         .extend({id: shortid.generate()})
    //         .mapObject(function (val, key) {
    //             if (key === 'nodeType') {
    //                 if (val === 'GNSS') {
    //                     val = 1
    //                 }
    //                 if (val === 'UWB') {
    //                     val = 2
    //                 }
    //             }
    //             if (_.contains(['nodeID', 'delaySend', 'x', 'y', 'z', 'channel', 'headLength', 'headCode', 'PRF'], key)) {
    //                 val = parseInt(val)
    //             }
    //             return val;
    //         })
    //         .value()
    //
    //     addStation(station)
    //         .then(function (data) {
    //             res.send(data)
    //         }, function (err) {
    //             res.status(500).send(err)
    //         })
    // })

    // TODO Label

    // TODO History related, data, config(station, label)
    app.get('/log/history', function (req, res) {

    })

}