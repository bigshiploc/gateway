/**
 * Created by xiaopingfeng on 9/30/17.
 */

const fs = require('fs-extra')
const path = require('path')
var config = require('./config')

// var DATA_DIR = 'log'
// var LOG_RAW = path.join(DATA_DIR, 'raw.log')
// var LOG_SERVICE = path.join(DATA_DIR, 'service.log')
// var LOG_FRAME = path.join(DATA_DIR, 'frame.log')
// var DATA_RAW_DIR = path.join(DATA_DIR, 'raw')
// var DATA_FRAME_DIR = path.join(DATA_DIR, 'frame')
// var DATA_RESULT_DIR = path.join(DATA_DIR, 'result')
fs.ensureDirSync(config.DIR.DATA_DIR)
fs.ensureDirSync(config.DIR.DATA_RAW_DIR)
fs.ensureDirSync(config.DIR.DATA_FRAME_DIR)
fs.ensureDirSync(config.DIR.DATA_RESULT_DIR)

var log4js = require('log4js')
log4js.configure({
    appenders: {
        terminal: {type: 'stdout'},
        services: {type: 'file', filename: config.DIR.LOG_SERVICE},
        raw: {type: 'file', filename: config.DIR.LOG_RAW},
        frame: {type: 'file', filename: config.DIR.LOG_FRAME},
    },
    categories: {
        default: {appenders: ['services', 'terminal'], level: 'debug'},
        frame: {appenders: ['frame'], level: 'info'},
        raw: {appenders: ['raw'], level: 'info'},
    }
})
var logger = log4js.getLogger('services')
logger.level = 'debug'

var MOCKUP = true

require('./services/web_server')
require('./services/message_server')
require('./services/raw_frame')
require('./services/raw_parser')
require('./services/database')
if (MOCKUP) {
    setTimeout(function () {
//         // require('./services/mock_services/mock_raw_pub')
//         // require('./services/mock_services/mock_wrapper')
        require('./mock_services/mock_faye')(
            config,
            path.join(__dirname+'/data/', 'result')
        )
    }, 3000)
} else {
//     var spawn = require('child_process').spawn
//     var wrapper = undefined
//     setTimeout(function () {
//         wrapper = spawn('C:\\bigship\\wrapper\\GPSUWB_CoreWrapper.exe', ['C:\\bigship\\wrapper\\test.json'])
//         wrapper.on('exit', function () {
//             console.log('wrapper has exited')
//         })
//         wrapper.stderr.on('data', function (data) {
//             console.error(data)
//         })
//     }, 1000)
}

var wrapper = undefined

logger.info("run_all", MOCKUP);

process.on('SIGINT', function () {
    if (wrapper) {
        wrapper.kill()
    }
    require('child_process').exec('taskkill /F /IM ServiceUWBLib.exe')
    require('child_process').exec('taskkill /F /IM ServiceRTKLib.exe')
    setTimeout(function () {
        process.exit(0)
    }, 1000)
})