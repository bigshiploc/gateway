/**
 * Created by xiaopingfeng on 10/3/17.
 */

var SEND_INTERVAL = 1000

var fs = require('fs')
var readline = require('readline');
var net = require('net');

class MockSender {

    constructor(file) {
        this.data_file = file
        console.log('data', this.data_file)
    }

    start_send() {
        var client = new net.Socket()
        var sender = this
        client.connect(8899, '127.0.0.1', function () {
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
                        console.log('complete')
                        clearInterval(task)
                    }
                }, SEND_INTERVAL)
            })
        })
    }
}

var RAW_DIR = 'test/raw/'
var rawFiles = fs.readdirSync(RAW_DIR)
var path = require('path')
rawFiles.forEach(function (file) {
    var f = path.join(RAW_DIR, file)
    console.log(f)
    new MockSender(f).start_send()
})
