/**
 * Created by xiaopingfeng on 10/3/17.
 */

var SEND_INTERVAL = 1000

var fs = require('fs')
var readline = require('readline');
var net = require('net');

class MockSender {

    constructor(file, server_ip, server_port) {
        this.data_file = file
        this.server_port = server_port
        this.server_ip = server_ip
    }

    start_send() {
        var client = new net.Socket()
        var sender = this
        client.connect(this.server_port, this.server_ip, function () {
            var lines = []
            console.log(sender)
            var myInterface = readline.createInterface({
                input: fs.createReadStream(sender.data_file)
                // input: fs.createReadStream('parse_failed.raw')
            });
            myInterface.on('line', function (line) {
                var data = Buffer.from(line, 'base64')
                lines.push(data)
            });
            myInterface.on('close', function () {
                var i = 0
                var task = setInterval(function () {
                    i++
                    if (lines[i]) {
                        client.write(lines[i]);
                    }

                    if (i == lines.length) {
                        clearInterval(task)
                    }
                }, SEND_INTERVAL)
            })
        })
    }
}

module.exports = function (config, raw_dir) {
    var rawFiles = fs.readdirSync(raw_dir)
    var path = require('path')
    rawFiles.forEach(function (file) {
        new MockSender(
            path.join(raw_dir, file),
            config.SERVERS.RAW_SERVER_IP,
            config.SERVERS.RAW_SERVER_PORT
        ).start_send()
    })

}

