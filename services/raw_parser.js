/**
 * Created by xiaopingfeng on 10/5/17.
 */

var config = require('../config')

var fs = require('fs')
var _ = require('underscore')
var path = require('path')
var Faye = require('faye')
var client = new Faye.Client(config.SERVERS.MQ_SERVER)

var result_dir = config.DIR.DATA_RESULT_DIR
var PORT = config.SERVERS.SIO_WRAPPER_PORT

function writeResultLog(session_id, type, data) {
    // console.log('result', data)
    data = JSON.parse(data)
    var node_id = undefined
    if ("rtkres_attitude" == type || "status" == type) {
        node_id = "global"
    } else {
        node_id = data.nodeID
    }
    // console.log(type, JSON.stringify(data))
    fs.appendFileSync(
        path.join(result_dir, session_id + '_' + node_id + '.' + type),
        JSON.stringify(data) + '\n'
    )
    return data
}

function fixResult(event, data) {
    if (event === 'user_uwb') {
        data.x = parseFloat(data.x)
        data.y = parseFloat(data.y)
    }
    // TODO change all data into numbers
    console.log({
        event: event,
        node: (_.contains(['user_uwb', 'rtkres_roverpos', 'user_stat', 'uwbbase_stat'], event)) ? data.nodeID : ''
    })
    return data
}

var EVENTS = require('../config').EVENTS
var express = require('express');
var socketio_server = require('http').createServer(express);
var io = require('socket.io')(socketio_server);
io.on('connection', function (socket) {
    var remoteAddress = socket.client.conn.remoteAddress,
        remotePort = socket.client.conn.remotePort

    var session_id = new Date().getTime()

    console.log({address: remoteAddress, port: remotePort}, 'new_connection')

    var listener = function onRaw(result) {
        var buffer = new Buffer(result.raw_pkg)
        socket.emit('raw', buffer)
        result.raw_pkg = buffer.toString('base64')
        delete result.raw
        // console.log(result, 'frame_to_wrapper')
    }

    var sub = client.subscribe('/frames', listener)

    EVENTS.forEach(function (eventName) {
        socket.on(eventName, function (data) {
            data = writeResultLog(session_id, eventName, data)
            data.eventname = eventName
            data.timestamp = new Date().getTime()
            client.publish('/node', {
                name: eventName,
                data: data,
            })
            data = fixResult(eventName, data)
        })
    })

    socket.on('disconnect', function () {
        console.log({address: remoteAddress, port: remotePort}, 'disconnect')
        sub.cancel()
    })
})

socketio_server.listen(PORT, '0.0.0.0');

console.log('listening for wrapper', PORT)

