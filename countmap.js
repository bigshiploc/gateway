var fs = require('fs')

var rawFiles = fs.readdirSync('..\\wrapper\\diff')
var path = require('path')

var num = 0;

function init() {
    console.log(num)
    var data = fs.readFileSync(path.join('..\\wrapper\\diff', rawFiles[num]));
    console.log(rawFiles[num])
    var line = data.toString().split('\n');
    var times = [];
    for (var i = 0; i < line.length-1; i++) {
        times.push(line[i].split(',')[1]);
    }
    count(times, rawFiles[num])
}

init();


function sortNumber(a, b) {
    return a - b
}

function count(times, file) {
    var sortTimes = times.sort(sortNumber)
    var maxTime = sortTimes[sortTimes.length - 1]
    var filter = 0;
    var taskTime = setInterval(function () {
        var count = []
        for (var i = 0; i < sortTimes.length; i++) {
            if (filter <= sortTimes[i] && sortTimes[i] < filter + 500) {
                count.push(sortTimes[i])
            }
        }

        fs.appendFileSync('..\\wrapper\\map\\' + file + '.map', filter + '-' + (filter + 500) + "," + Math.round(count.length / sortTimes.length * 10000) / 100.00 + "%" + '\n')
        filter += 500
        if (filter > maxTime) {
            clearInterval(taskTime)

            num++
            if(num<rawFiles.length){
                init()
            }
        }
    }, 10)
}