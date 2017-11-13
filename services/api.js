const _ = require('underscore')
var spawn = require('child_process').spawn

const path = require('path')
var elasticsearch = require('elasticsearch')
var fs = require("fs")
var rp = require('request-promise')
rp = rp.defaults({json: true})
const Faye = require('faye')
const config = require('../config')
var client = new Faye.Client(config.SERVERS.MQ_SERVER)

var esclient = new elasticsearch.Client({
    host: config.SERVERS.ES_SERVER,
})

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

function getVehicle() {
    return rp({uri: HOST + '/vehicle'})
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
var allId = [];

function login(req, res, next) {
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
}

function logout(req, res) {
    req.session.destroy();
    req.logout();
    res.send('logout')
}

function isLogin(req, res) {
    if (!req.isAuthenticated()) {
        return res.send({bool: false})
    } else {
        return res.send({bool: true, user: req.user})
    }
}

function createNode(req, res, next) {
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
    req.body.id = JSON.stringify(req.body.nodeID);
    console.log(req.body)
    next()
}

function updateNode(req, res, next) {
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
}

function deleteNode(req, res, next) {
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
}

module.exports = function (app) {
    app.post('/login', login)
    app.get('/logout', logout);
    app.get('/isLogin', isLogin);
    app.post('/nodes', createNode);
    app.put('/nodes/:id', updateNode);
    app.delete('/nodes/:id', deleteNode);

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
                getAllId(data,node);
                console.log(allId);
                createNodeInfo(allId, data);
                nodeHistoryData(allId, req, res);
            });
        }, function (err) {
            console.trace(err.message);
        });
    });

    function getAllId(data,node){
        for (var i = 0; i < data.length; i++) {
            if (allId.indexOf(data[i]._source.id) === -1) {
                allId.push(data[i]._source.id)
            }
        }

        for (var j = 0; j < node.length; j++) {
            if (allId.indexOf(node[j].id) === -1) {
                allId.push(node[j].id)
            }
        }
    }

    function createNodeInfo(allId, result) {
        var arr = [];
        for (var j = 0; j < result.length; j++) {
            if (result[j]._source.id == allId[labelNum]) {
                arr.push(result[j]._source)
            }
        }

        labelHistoryInfo.push(arr);
        labelNum++;
        if (labelNum < allId.length) {
            createNodeInfo(allId, result)
        }
    }

    function nodeHistoryData(data, req, res) {
        if (labelHistoryInfo[labelLastOne] && ((labelHistoryInfo[labelLastOne].length == 0) ||
                (labelHistoryInfo[labelLastOne].length == 1 && labelHistoryInfo[labelLastOne][0].hasOwnProperty('delete')))) {
            getOneNodeData(data, req, res)
        } else if (labelLastOne <= labelHistoryInfo.length - 1) {
            labelLastOne++;
            nodeHistoryData(data, req, res)
        } else {
            res.send({
                labelHistoryInfo: labelHistoryInfo
            });
            console.log('--返回label结束！！！')
        }
    }

    function sortUpdateDate(a, b) {
        return b._source.updateDate - a._source.updateDate
    }

    function getOneNodeData(data, req, res) {
        esclient.search({
            index: 'bigship',
            type: 'history',
            body: {
                query: {
                    match: {
                        id: data[labelLastOne]
                    }
                }
                , size: 10000
            }
        }).then(function (resp) {
            var hits = resp.hits.hits;
            hits.sort(sortUpdateDate);

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
            nodeHistoryData(data, req, res)
        })
    }

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
                require('child_process').exec('taskkill /F /IM ServiceUWBLib.exe');
                require('child_process').exec('taskkill /F /IM ServiceRTKLib.exe');
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

    app.get('/wrapper/stop', function (req, res) {
        console.log('stop');
        if (wrapper_thread) {
            wrapper_thread.kill()
            require('child_process').exec('taskkill /F /IM ServiceUWBLib.exe');
            require('child_process').exec('taskkill /F /IM ServiceRTKLib.exe');
            wrapper_thread = undefined
        }
    });

};