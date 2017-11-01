var _ = require('underscore')

var rp = require('request-promise');
rp = rp.defaults({json: true});

var Faye = require('faye')
var config = require('./config')
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

    app.get('/getAllArea', function (req, res) {
        rp({uri: HOST + '/areas'})
            .then(function (data) {
                res.send(data)
            })
        // getNodes()
        //     .then(function (nodes) {
        //         var stations = _.filter(nodes, function (node) {
        //             return (node.nodeType == 1 || node.nodeType == 2);
        //         })
        //         res.send(stations)
        //     })

    })

    app.get('/getAllStationInfo', function (req, res) {
        rp({uri: HOST + '/nodes?nodeType=1&nodeType=2'})
            .then(function (data) {
                res.send(data)
            })
    })
    app.get('/getAllLabelInfo', function (req, res) {
        rp({uri: HOST + '/nodes?nodeType=3'})
            .then(function (data) {
                res.send(data)
            })
    })

    app.get('/getStationInfo/:station_type', function (req, res) {
        console.log(req.params['station_type'])
        rp({uri: HOST + '/nodes?nodeType=' + req.params['station_type']})
            .then(function (data) {
                res.send(data)
            })
    })

    app.get('/wrapper/config', function (req, res) {
        getWrapperConfig()
            .then(function (data) {
                res.send(data)
            }, function (err) {
                res.status(500).send(err)
            })
    })

    // TODO Station


    // TODO Label


    // TODO History related, data, config(station, label)
    app.get('/log/history', function (req, res) {

    })

}