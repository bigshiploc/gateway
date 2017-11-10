const _ = require('underscore');
const shortid = require('shortid');
var spawn = require('child_process').spawn;
var passport = require('passport');

const path = require('path');
var elasticsearch = require('elasticsearch');
var fs = require("fs");
var rp = require('request-promise');
rp = rp.defaults({json: true});
const Faye = require('faye');
const config = require('../config');
var client = new Faye.Client(config.SERVERS.MQ_SERVER);

var esclient = new elasticsearch.Client({
    host: config.SERVERS.ES_SERVER,
});

var HOST = 'http://127.0.0.1:' + config.SERVERS.WEB_SERVER_PORT;

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

function getVehicle() {
    return rp({uri: HOST + '/vehicle'})
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
        getVehicle()
    ]).then(function (results) {
        var zone = results[0],
            wrapper = results[1],
            uwb = results[2],
            rtk = results[3],
            nodes = results[4],
            vehicle = results[5],
            uwb_nodes = _.where(nodes, {'nodeType': 2}),
            rtk_nodes = _.where(nodes, {'nodeType': 1});

        uwb['base.conf'] = uwb_nodes;
        rtk['base.conf'] = rtk_nodes;
        wrapper['uwb_bases'] = _.pluck(uwb_nodes, 'nodeID');
        wrapper['rtk_bases'] = _.pluck(rtk_nodes, 'nodeID');

        return Promise.resolve({
            zone: zone,
            wrapper: wrapper,
            UWB: uwb,
            RTK: rtk,
            nodes: nodes,
            vehicle: vehicle,
        })
    })
}

function getUser(username) {
    return rp({uri: HOST + '/users' + username})
}
var labelHistoryInfo = [];
var labelNum = 0;
var labelLastOne = 0;

var allDataObj = {};

module.exports = function (app) {
    app.post('/login', function (req, res, next) {
        getUser('?username=' + req.body.username).then(function (user) {
            if (user.length == 0) {
                res.send(false);
            } else {
                user = user[0];
                if (user.password != req.body.password) {
                    res.send(false)
                } else {
                    req.logIn(user, function (err) {
                        if (err) return next(err);
                        return res.send(user);
                    })
                }
            }
        })
    });

    app.get('/logout', function (req, res) {
        req.session.destroy();
        req.logout();
        res.send('logout')
    });

    app.get('/isLogin', function (req, res) {
        if (!req.isAuthenticated()) {
            return res.send({bool: false})
        } else {
            return res.send({bool: true, user: req.user})
        }
    });

    // app.get('/isAuthenticated', function () {
    //     return function (req, res, next) {
    //         if (req.isAuthenticated()) {
    //             next()
    //         } else {
    //             return res.send({bool: false});
    //         }
    //     }
    // });

    app.post('/nodes', function (req, res, next) {
        function afterResponse() {
            res.removeListener('finish', afterResponse);
            res.removeListener('close', afterResponse);
            if (res.statusCode == 201) {
                var info = {id: res.locals.data.id, nodeID: res.locals.data.nodeID, updateDate: new Date().getTime()};
                info.beforeUpdateInfo = null;
                info.afterUpdateInfo = res.locals.data;
                esclient.index({
                    index: 'bigship',
                    type: 'history',
                    body: info
                }, function (error, response) {
                    console.log(response)
                });
            }
        }

        res.on('finish', afterResponse);
        res.on('close', afterResponse);
        req.body.id = req.body.nodeID;
        console.log(req.body)
        next()
    });

    app.put('/nodes/:id', function (req, res, next) {
        var info = {id: req.params.id, nodeID: req.body.nodeID, updateDate: new Date().getTime()};
        info.afterUpdateInfo = req.body;
        rp({uri: HOST + '/nodes/' + req.params.id}).then(function (node) {
            info.beforeUpdateInfo = node;
            res.on('finish', afterResponse);
            res.on('close', afterResponse);
            next()
        });

        function afterResponse() {
            res.removeListener('finish', afterResponse);
            res.removeListener('close', afterResponse);
            esclient.index({
                index: 'bigship',
                type: 'history',
                body: info
            }, function (error, response) {
                console.log(response)
            });
        }
    });

    app.delete('/nodes/:id', function (req, res, next) {
        var info = {id: req.params.id, updateDate: new Date().getTime(), delete: true};

        function afterResponse() {
            res.removeListener('finish', afterResponse);
            res.removeListener('close', afterResponse);
            esclient.index({
                index: 'bigship',
                type: 'history',
                body: info
            }, function (error, response) {
                console.log(response)
            });
        }

        res.on('finish', afterResponse);
        res.on('close', afterResponse);
        next()
    });

    app.get('/getHistoryDataFile', function (req, res) {
        var fork = require('child_process').fork;
        var child = fork(__dirname + '/save_file.js');
        child.send({start: req.query.startTime, end: req.query.endTime, msg: ""});

        child.on('message', function (msg) {
            if (msg != 'close' && msg != 'timeout') {
                res.sendFile(msg)
            } else if (msg == 'timeout') {
                res.send('false')
            }
            child.send({msg: 'close'});
        });
    });

    app.get('/getAllHistoryInfo', function (req, res) {

        labelHistoryInfo = [];
        labelNum = 0;
        labelLastOne = 0;
        esclient.search({
            index: 'bigship',
            type: 'history',
            body: {
                query: {
                    range: {updateDate: {gte: req.query.startTime, lte: req.query.endTime}}
                }, size: 10000
            }
        }).then(function (resp) {
            var data = resp.hits.hits;
            rp({uri: HOST + '/nodes'}).then(function (node) {
                var allId = [];
                for (var i = 0; i < data.length; i++) {
                    if (allId.indexOf(Number(data[i]._source.id)) === -1) {
                        allId.push(Number(data[i]._source.id))
                    }
                }

                for (var j = 0; j < node.length; j++) {
                    if (allId.indexOf(node[j].id) === -1) {
                        allId.push(node[j].id)
                    }
                }
                console.log(allId);
                createLabelInfo(allId, data);
                labelHistoryData(allId, req, res);
            });
        }, function (err) {
            console.trace(err.message);
        });
    });

    function createLabelInfo(allId, result) {
        var arr = [];
        for (var j = 0; j < result.length; j++) {
            if (result[j]._source.id == allId[labelNum]) {
                arr.push(result[j]._source)
            }
        }

        labelHistoryInfo.push(arr);
        labelNum++;
        if (labelNum < allId.length) {
            createLabelInfo(allId, result)
        }
    }

    function labelHistoryData(data, req, res) {
        if (labelHistoryInfo[labelLastOne] && ((labelHistoryInfo[labelLastOne].length == 0) ||
            (labelHistoryInfo[labelLastOne].length == 1 && labelHistoryInfo[labelLastOne][0].hasOwnProperty('delete')))) {
            getOneLabelData(data, req, res)
        } else if (labelLastOne <= labelHistoryInfo.length - 1) {
            labelLastOne++;
            labelHistoryData(data, req, res)
        } else {
            res.send({
                labelHistoryInfo: labelHistoryInfo
            });
            console.log('--返回label结束！！！')
        }
    }

    function sortNumber(a, b) {
        return b._source.updateDate - a._source.updateDate
    }

    function getOneLabelData(data, req, res) {
        esclient.search({
            index: 'bigship',
            type: 'history',
            body: {
                query: {
                    match: {
                        id: data[labelLastOne]
                    }
                }
                // query: {
                //     range: {updateDate: {lt: req.query.startTime}}
                // }
                , size: 10000
            }
        }).then(function (resp) {
            var hits = resp.hits.hits;
            hits.sort(sortNumber);

            for (var i = 0; i < hits.length; i++) {
                if (hits[i] && hits[i]._source.updateDate < req.query.startTime) {
                    if (!hits[i]._source.hasOwnProperty('delete')) {
                        console.log('-------lastOne----' + data[labelLastOne]);
                        labelHistoryInfo[labelLastOne].push(hits[i]._source);
                        break;
                    }
                }
            }
            labelLastOne++;
            labelHistoryData(data, req, res)
        })
    }

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

    var wrapper_thread = undefined;

    process.on('SIGINT', function () {
        if (wrapper_thread) {
            wrapper_thread.kill()
        }
        require('child_process').exec('taskkill /F /IM ServiceUWBLib.exe');
        require('child_process').exec('taskkill /F /IM ServiceRTKLib.exe');
        setTimeout(function () {
            process.exit(0)
        }, 1000)
    });

    function startWrapper(config_file) {
        return new Promise(function (resolve, reject) {
            if (wrapper_thread) {
                wrapper_thread.kill();
                wrapper_thread = undefined
            }
            setTimeout(function () {
                wrapper_thread = spawn(config.WRAPPER_CORE_EXE, [config_file]);
                wrapper_thread.on('exit', function () {
                    console.log('wrapper has exited')
                });
                wrapper_thread.stderr.on('data', function (data) {
                    console.error(data)
                });
                resolve(wrapper_thread)
            }, 1000)
        })
    }

    app.get('/wrapper/restart', function (req, res) {
        console.log('restart');
        getWrapperConfig()
            .then(function (data) {
                var config_file = path.join(config.DIR.CONFIG_DIR, 'wrapper_' + new Date().getTime() + '.json');
                fs.writeFileSync(
                    config_file,
                    JSON.stringify(data)
                );
                return startWrapper(config_file)
            })
            .then(function (pid) {
                res.send('ok')
            }, function (err) {
                res.send(500, err)
            })
    });
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

};