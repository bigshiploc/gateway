/**
 * Created by xiaopingfeng on 10/5/17.
 */
/**
 * Created by xiaopingfeng on 9/12/17.
 */

var SEND_INTERVAL = 1000

var fs = require('fs')
var readline = require('readline');
var net = require('net');
var path = require('path')

class MockWrapper {

    constructor(file, server_id, server_port) {
        this.data_file = file
        this.server_port = server_port
        this.server_ip = server_ip
    }

    start_send() {
        var sender = this
        var lines = []
        var myInterface = readline.createInterface({
            input: fs.createReadStream('test/result/1507620014694_514.user_uwb', 'utf8')
        });
        myInterface.on('line', function (line) {
            // var data = Buffer.from(line, 'base64')
            var data = line
            lines.push(data)
        });
        myInterface.on('close', function () {
            console.log('mock_services up data ready')

            var socket = require('socket.io-client')('http://127.0.0.1:3000');
            socket.on('connect', function () {
                console.log('connected!')
                var i = 0
                var task = setInterval(function () {
                    i++
                    if (lines[i]) {
                        var result = lines[i]
                        var data = JSON.parse(result)
                        result = JSON.stringify(data)
                        socket.emit('user_uwb', result)
                    }

                    if (i == lines.length) {
                        console.log('complete')
                        clearInterval(task)
                    }
                }, SEND_INTERVAL)

            });
            socket.on('raw', function (data) {
            });
            socket.on('disconnect', function () {
                console.log('disconnect')
            });
        })
    }
}

module.exports = function (config, result_dir) {
    var resultFiles = fs.readdirSync(result_dir)
    resultFiles.forEach(function (file) {
        new MockWrapper(
            path.join(result_dir, file),
            config.SERVERS.SIO_WRAPPER_IP,
            config.SERVERS.SIO_WRAPPER_PORT
        ).start_send()
    })

}

