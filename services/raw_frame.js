/**
 * Created by xiaopingfeng on 10/4/17.
 */
/**
 * Created by xiaopingfeng on 9/13/17.
 */

var config = require('../config.js')

var logger = require('log4js').getLogger('raw')
var logger_frame = require('log4js').getLogger('frame')

var net = require('net')
var path = require('path')

var Parser = require('binary-parser').Parser
var parser = new Parser()
    .endianess('little')
    .uint32('magic_header', {assert: 0x5aa555aa})
    .uint8('node_type')
    .uint32('node_id')
    .uint8('frame_type')
    .uint16('pkg_length')
    .uint8('frame_id')
    .uint16('reserved_2')
    .uint8('reserved_3')
    .buffer('raw', {
        length: function () {
            return this.pkg_length - 4;
        }
    })
    .uint8('raw_crc')

var fs = require('fs')

function logRaw(remote_address, remote_port, data) {
    fs.appendFileSync(
        path.join(config.DIR.DATA_RAW_DIR, remote_address + '_' + remote_port + '.raw'),
        data.toString('base64') + '\n'
    )
    // console.log(remote_address, data.length, data)
}

var MAGIC_HEADER = 'aa55a55a'

var MagicHeader = new Buffer(MAGIC_HEADER, 'hex');

var Faye = require('faye')
// var client = new Faye.Client('http://localhost:8001/events')
var client = new Faye.Client(config.SERVERS.MQ_SERVER)

var server = net.createServer(function (socket) {
    var remote_address = socket.remoteAddress
    var remote_port = socket.remotePort

    var current_buff = undefined
    logger.info('connection_socket', remote_address, remote_port)
    socket.on('data', function (data) {
        logRaw(remote_address, remote_port, data)
        var results = []
        var log = {
            success: false,
            data: data
        }
        current_buff = (current_buff ) ? Buffer.concat([current_buff, data]) : data
        try {
            // Trim the buffer for MagicHeader
            var magicHeaderIndex = current_buff.indexOf(MagicHeader)
            if (magicHeaderIndex > 0) {
                current_buff = current_buff.slice(
                    current_buff.indexOf(MagicHeader)
                )
            } else if (magicHeaderIndex < 0) {
                // TODO if MagicHeader doesn't exists
                current_buff = undefined
                console.log('SHOULD NOT BE HERE')
            }

            var isEnd = false
            var result = undefined
            while (!isEnd) {
                result = parser.parse(current_buff)
                results.push(result)

                var frameLength = 12 + result.pkg_length + 1
                result.raw_pkg = current_buff.slice(0, frameLength)
                result.frame_len = frameLength
                current_buff = current_buff.slice(frameLength)
                isEnd = (current_buff.length == 0)
            }

            log.msg = 'parsed,' + results.length
            if (current_buff.length == 0) {
                current_buff = undefined
            }
        } catch (err) {
            // console.error(err)
            log.msg = 'parse failed'
        }

        results.forEach(function (result) {
            result.crc = 0
            for (var i = 0; i < result.frame_len - 1; i++) {
                result.crc = result.crc ^ result.raw_pkg[i]
            }
            if (result.raw_crc != result.crc) {
                log.err_msg = "crc failed," + result.raw_crc + "," + result.crc
                log.success = false
                log.show = true
                logger.error(log)
            } else {
                log.success = true
                client.publish('/frames', result)
                logger.info(result)
            }
            logger_frame.info(JSON.stringify(log))
        })

        // log.data_len = (log.data) ? log.data.length : undefined
        // if (log.show) {
        //   console.log(log)
        // }
    })
});

server.listen(config.SERVERS.RAW_SERVER_PORT, '0.0.0.0');
