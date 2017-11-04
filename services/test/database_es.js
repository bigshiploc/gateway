var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');

var Faye = require('faye')
var client = new Faye.Client('http://localhost:8001/events')

// Connection URL 
var url = 'mongodb://localhost:27017/bigship';
// Use connect method to connect to the Server 
MongoClient.connect(url, function (err, db) {
    // assert.equal(null, err);
    if (err) {
        console.log('cannot connect to database')
    } else {
        client.subscribe('/node', function (message) {
            var collection = db.collection('event');
            collection.insertMany([message.data],
                function (err, result) {
                    // console.log(err)
                })
            console.log(message.data)
        });
    }
    // db.close();
});

