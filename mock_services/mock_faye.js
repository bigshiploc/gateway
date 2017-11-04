var SEND_INTERVAL = 1000

var fs = require('fs')
var readline = require('readline');
var net = require('net');
var path = require('path')
var Faye = require('faye')

function getExtension(file) {
    var parts = file.split('\.')
    return parts[parts.length - 1]
}

class MockWrapper {
    constructor(file, server) {
        this.data_file = file
        this.server = server
    }

    start_send() {
        var self = this
        var type = getExtension(this.data_file)
        console.log('mock', this.server, this.data_file, type)
        var client = new Faye.Client(self.server)

        var lines = []
        var myInterface = readline.createInterface({
            input: fs.createReadStream(self.data_file)
        });
        myInterface.on('line', function (line) {
            if (line) {
                console.log(self.data_file, line)
                lines.push(JSON.parse(line))
            }
        });
        myInterface.on('close', function () {
            var i = 0
            var task = setInterval(function () {
                i++
                if (lines[i]) {
                    client.publish('/node', {
                        name: type,
                        data: lines[i],
                    })
                    console.log({name: type})
                }

                if (i == lines.length) {
                    clearInterval(task)
                }
            }, SEND_INTERVAL)
        })
    }
}

module.exports = function (config, result_dir) {
    console.log(config)
    var resultFiles = fs.readdirSync(result_dir)
    resultFiles.forEach(function (file) {
        if (file.indexOf('\.') > 0) {
            new MockWrapper(
                path.join(result_dir, file),
                config.SERVERS.MQ_SERVER
            ).start_send()
        }
    })

}