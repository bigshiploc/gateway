var config = require('./config')
var fs = require('fs')
var _ = require('underscore')

var Faye = require('faye')
var client = new Faye.Client(config.SERVERS.MQ_SERVER)

var frameTimestamp = {}
var last = {};
var currentTime = new Date().getTime()

function fixFrame(data) {
    var fileName = data.node_id + '_'+ data.node_type + '_' + data.frame_type+'_'+currentTime;

    if (frameTimestamp[fileName]) {
        // console.log(data.frame_type+ str + ' framptime: ' + (data.timestamp - frameTimestamp[str]))
        fs.appendFileSync('.\\monitor\\'+fileName+'.frame.diff', data.timestamp+','+(data.timestamp - frameTimestamp[fileName])+'\n')
    } else {
        fs.appendFileSync('.\\monitor\\' + fileName + '.frame.diff', data.timestamp + ',0' + '\n')
        console.log('+000000000000000')
    }
    frameTimestamp[fileName] = data.timestamp;

    return data
}

var getFrame = function onRaw(result) {
    fixFrame(result.data)
}

var frame = client.subscribe('/monitorFrame', getFrame)


function fixResult(event, data) {
    var info = {
        event: event,
        node: (_.contains(['rtkres_roverobs', 'user_uwb', 'rtkres_roverpos', 'user_stat', 'uwbbase_stat'], event)) ? data.nodeID : ''
    }
    var str = info.node+'_'+currentTime;
    if (last[str]) {
        fs.appendFileSync('.\\monitor\\' + str + '.wrapper.diff', data.timestamp + ',' + (data.timestamp - last[str]) + '\n')
    } else {
        fs.appendFileSync('.\\monitor\\' + str + '.wrapper.diff', data.timestamp + ',0' + '\n')
        console.log('-000000000000000')
    }
    last[str] = data.timestamp;

    return data
}

var listener = function onRaw(result) {
    console.log(result.name)
    if (result.name == 'user_uwb' || result.name == 'rtkres_roverpos') {
        console.log(result.name)
        fixResult(result.name, result.data)
    }
}

var sub = client.subscribe('/monitor', listener)
