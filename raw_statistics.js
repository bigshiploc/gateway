var SEND_INTERVAL = 1

var fs = require('fs')
var readline = require('readline');
var net = require('net');
var path = require('path')
var Faye = require('faye')

function getExtension(file) {
    var parts = file.split('\.')
    return parts[parts.length - 1]
}

function getFileName(file) {
    var parts = file.split('\\')
    var port = parts[parts.length - 1].split('\.raw')
    return port[0]
}

function sortNumber(a, b) {
    return a - b
}

class MockWrapper {
    constructor(dir, file, server) {
        this.dir = dir
        this.data_file = file
        this.server = server
    }

    start_send() {
        var self = this
        var type = getExtension(this.data_file)
        console.log('mock', this.server, this.data_file, type)
        var client = new Faye.Client(self.server)
        var filename = getFileName(this.data_file)
        console.log(this.dir)
        var fWriteName = this.dir + '\\' + filename + '.raw.diff';
        var fWrite = fs.createWriteStream(fWriteName);

        var lines = []
        var myInterface = readline.createInterface({
            input: fs.createReadStream(self.data_file)
        });
        myInterface.on('line', function (line) {
            if (line) {
                var lineData = line.split("\t");
                // new Buffer(lineData[1], 'base64').toString()
                lines.push(JSON.parse(lineData[0]))
            }
        });
        myInterface.on('close', function () {
            var i = 0
            var times = []
            var task = setInterval(function () {
                if (lines[i]) {
                    var num = 0;
                    if (i === 0) {
                        num = 0;
                    } else {
                        num = lines[i] - lines[i - 1];
                    }
                    times.push(num)
                    var unixTimestamp = new Date(lines[i])
                    var commonTime = unixTimestamp.toLocaleString()
                    fWrite.write(lines[i] + ',' + num + '\n'); // 下一行
                }

                if (i == lines.length) {
                    clearInterval(task)

                    var writeName = self.dir + '\\' + filename + '.raw.diff.map';
                    var writefile = fs.createWriteStream(writeName);
                    var filter = 0;
                    var sortTimes = times.sort(sortNumber)
                    var maxTime = sortTimes[sortTimes.length - 1]

                    var taskTime = setInterval(function () {
                        var count = []
                        for (var i = 0; i < sortTimes.length; i++) {
                            if (filter <= sortTimes[i] && sortTimes[i] < filter + 500) {
                                count.push(sortTimes[i])
                            }
                        }
                        writefile.write(filter + '-' + (filter + 500) + "," + Math.round(count.length / sortTimes.length * 10000) / 100.00 + "%" + '\n'); // 下一行
                        filter += 500
                        if (filter > maxTime) {
                            clearInterval(taskTime)
                        }
                    }, 10)
                }
                i++
            }, SEND_INTERVAL)
        })
    }
}

function deleteall(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteall(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
    }
};

module.exports = function (config, result_dir) {
    // deleteall(result_dir)
    // deleteall(result_dir)

    var resultFiles = fs.readdirSync(result_dir)
    resultFiles.forEach(function (file) {
        if (file.substr(file.length - 4) === '.raw') {
            console.log(file)
            new MockWrapper(
                result_dir,
                path.join(result_dir, file),
                config.SERVERS.MQ_SERVER
            ).start_send()
        }
    })

}