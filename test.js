var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});

var data = [
    {
        "nodeID": "515",
        "name": "515",
        "nodeType": 3,
        "createdAt": 1509779300682,
        "id": 13
    },
    {
        "nodeID": "516",
        "name": "516",
        "nodeType": 3,
        "createdAt": 1509779305606,
        "id": 14
    },
    {
        "nodeID": "517",
        "name": "517",
        "nodeType": 3,
        "createdAt": 1509779310918,
        "id": 15
    },
    {
        "nodeID": "518",
        "name": "518",
        "nodeType": 3,
        "createdAt": 1509779316342,
        "id": 16
    },
    {
        "nodeID": "513",
        "name": "513",
        "nodeType": 3,
        "createdAt": 1509779329158,
        "id": 17
    },
    {
        "nodeID": "514",
        "name": "514",
        "nodeType": 3,
        "createdAt": 1510196493324,
        "id": 30
    },
    {
        "x": 0,
        "y": 0,
        "z": 2,
        "nodeID": "1",
        "name": "1",
        "nodeType": 1,
        "createdAt": 1510199033712,
        "id": 31
    },
    {
        "x": 3.822,
        "y": 172.624,
        "z": 2.333,
        "nodeID": "2",
        "name": "2",
        "nodeType": 1,
        "createdAt": 1510199049711,
        "id": 32
    },
    {
        "x": -57.538,
        "y": 103.813,
        "z": 2.41,
        "nodeID": "3",
        "name": "3",
        "nodeType": 1,
        "createdAt": 1510199077842,
        "id": 33
    },
    {
        "x": 0,
        "y": 0,
        "z": 3.2,
        "nodeID": 256,
        "name": "0",
        "nodeType": 2,
        "channel": 0,
        "headLength": 0,
        "headCode": 0,
        "PRF": 0,
        "delaySend": 0,
        "createdAt": 1510205290888,
        "id": 34,
        "coordinate": "24,0,3",
        "status": 0
    },
    {
        "x": 1.2,
        "y": -0.6,
        "z": 3.2,
        "nodeID": 257,
        "name": "1",
        "nodeType": 2,
        "channel": 0,
        "headLength": 0,
        "headCode": 0,
        "PRF": 0,
        "delaySend": 0,
        "createdAt": 1510205323001,
        "id": 35,
        "coordinate": "1.2,-0.6,3",
        "status": 0
    },
    {
        "x": 2.4,
        "y": 0,
        "z": 3.2,
        "nodeID": 258,
        "name": "2",
        "nodeType": 2,
        "channel": 0,
        "headLength": 0,
        "headCode": 0,
        "PRF": 0,
        "delaySend": 0,
        "createdAt": 1510205341674,
        "id": 36,
        "coordinate": "2.4,3,3.2",
        "status": 0
    },
    {
        "x": 2.4,
        "y": 3,
        "z": 3.2,
        "nodeID": 260,
        "name": "4",
        "nodeType": 2,
        "channel": 0,
        "headLength": 0,
        "headCode": 0,
        "PRF": 0,
        "delaySend": 0,
        "createdAt": 1510205360658,
        "id": 37,
        "coordinate": "1.2,3.2,3.2",
        "status": 0
    },
    {
        "x": 1.2,
        "y": 3.2,
        "z": 3.2,
        "nodeID": 261,
        "name": "5",
        "nodeType": 2,
        "channel": 0,
        "headLength": 0,
        "headCode": 0,
        "PRF": 0,
        "delaySend": 0,
        "createdAt": 1510205379786,
        "id": 38,
        "coordinate": "0,24,3"
    },
    {
        "x": 0,
        "y": 3,
        "z": 3.2,
        "nodeID": 262,
        "name": "6",
        "nodeType": 2,
        "channel": 0,
        "headLength": 0,
        "headCode": 0,
        "PRF": 0,
        "delaySend": 0,
        "createdAt": 1510205397059,
        "id": 39,
        "coordinate": "0,23,3.2",
        "status": 0
    },
    {
        "nodeType": 3,
        "nodeID": 520,
        "name": "520",
        "createdAt": 1512005621772,
        "id": "520"
    }
]

var timeArr = [];
function editData() {
    for(var i =0;i<data.length;i++){
        var info = {id: data[i].nodeID, nodeID: data[i].nodeID, updateDate: data[i].createdAt};
        info.beforeUpdateInfo = null;
        info.afterUpdateInfo = data[i];
        timeArr.push(info)
    }
}
editData()
function saveDate() {
    var bulk = [];

    for (var i = 0; i < timeArr.length; i++) {
        var index = { index:  { _index: 'bigship', _type: 'history' } }
        bulk.push(index)
        bulk.push(timeArr[i])
    }
    client.bulk({
        body: bulk
    }, function (err, resp) {
        console.log(resp)
    });

}
saveDate()