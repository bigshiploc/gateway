/**
 * Created by chenyu on 17/11/4.
 */

var elasticsearch = require('elasticsearch');
const config = require('../config')
var esclient = new elasticsearch.Client({
    host: config.SERVERS.ES_SERVER,
});
var fs = require("fs");
const path = require('path')
var child_process = require('child_process');

var stationHistoryInfo = [];
var labelHistoryInfo = [];
var stationNum = 0;
var stationLastOne = 0;
var labelNum = 0;
var labelLastOne = 0;

var allDataObj = {};
var lastDataArr = [];

function getTimeDifference(start, end, allDataObj, fileName, res) {
    var startTime = getTime(start);
    var endTime = getTime(end);
    var timeDifference = endTime - startTime;
    console.log(timeDifference);
    getLastData(startTime, endTime, timeDifference, allDataObj, fileName, res)
}


function getLastData(startTime, endTime, timeDifference, allDataObj, fileName, res) {
    console.log('=====================time');
    if (Object.keys(allDataObj).length == 0) {
        fs.writeFileSync(path.join(__dirname, '../public/data/' + fileName), '[]')
        process.send(path.join(__dirname, '../public/data/' + fileName))
    }
    for (var i = 0; i < timeDifference; i++) {
        var obj = {};
        for (var j in allDataObj) {
            if (j in obj == true) {
                getOneSecondData(obj, j, i, startTime, endTime, allDataObj);
            } else {
                obj[j] = [];
                getOneSecondData(obj, j, i, startTime, endTime, allDataObj);
            }
        }
        lastDataArr.push(obj);
    }
    saveDataArr(fileName, res);
    // console.log(lastDataArr[0]);   // 这里得到基本的数据。（不包含节点信息的数据。）
}

function getOneSecondData(obj, name, i, startTime, endTime, allDataObj) {
    for (var z = 0; z < allDataObj[name].length; z++) {
        var timeData = getTime(allDataObj[name][z].timestamp);
        if (startTime + i <= timeData && timeData < startTime + i + 1 && startTime <= timeData && timeData <= endTime) {
            obj.timestamp = allDataObj[name][z].timestamp;
            obj[name].push(allDataObj[name][z])
        }
    }
}

function saveDataArr(fileName, res) {
    fs.writeFile(path.join(__dirname, '../public/data/' + fileName), JSON.stringify(lastDataArr), function (err) {
        // res.sendFile(path.join(__dirname, '../public/data/' + fileName))
        process.send(path.join(__dirname, '../public/data/' + fileName))
        console.log('--保存文件结束！！！')
        lastDataArr.length = 0;
    });
}

function getTime(timeStamp) {
    return parseInt(timeStamp / 1000)
}

function getHistoryInfo(start, end, fileName, res) {
    esclient.search({
        index: 'bigship',
        type: 'constituencies',
        body: {
            query: {
                range: {timestamp: {gte: start, lte: end}}
            }, size: 10000
        }
    }).then(function (resp) {
        var data = resp.hits.hits;
        var allDataObj = {};
        for (var j = 0; j < data.length; j++) {
            if (!allDataObj.hasOwnProperty(data[j]._source.eventname)) {
                allDataObj[data[j]._source.eventname] = [];
            }
        }
        for (var i = 0; i < data.length; i++) {
            allDataObj[data[i]._source.eventname].push(data[i]._source)
        }

        getTimeDifference(start, end, allDataObj, fileName, res)
    }, function (err) {
        console.trace(err.message);
    });
}
process.on('message', function(data){
    if (data.msg == 'close') {
        return process.exit()
    }
    var timeDifference = getTime(data.end) - getTime(data.start);
    console.log(timeDifference);
    var fileName = new Date().getTime() + '.json';
    getHistoryInfo(data.start, data.end, fileName)
    setTimeout(function () {
        return process.send('timeout')
    }, 1000 * 20)
});
