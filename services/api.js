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

    app.get('/getHistoryDataFile', function (req, res) {
        var fork = require('child_process').fork;
        var child = fork(__dirname+'/save_file.js');
        child.send({start:req.query.startTime,end:req.query.endTime,msg:""});

        child.on('message', function (msg) {
            if(msg!='close'){
                res.sendFile(msg)
            }else if(msg=='timeout'){
                res.send('false')
            }
            child.send({msg:'close'})
            console.log('parent get message: ' + JSON.stringify(msg));
        });
        child.on('exit',function () {

        })
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