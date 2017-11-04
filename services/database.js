var config = require('../config')

var Faye = require('faye')
var client = new Faye.Client(config.SERVERS.MQ_SERVER)

var elasticsearch = require('elasticsearch');
var esclient = new elasticsearch.Client({
    host: config.SERVERS.ES_SERVER,
});

client.subscribe('/node', function (message) {
    esclient.index({
        index: 'bigship',
        // id: '1',
        type: 'constituencies',
        body: message.data
    }, function (err, resp, status) {
        // console.log(resp);
    });
    console.log(message.data)
});