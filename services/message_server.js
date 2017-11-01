/**
 * Created by xiaopingfeng on 9/30/17.
 */
var logger = require('log4js').getLogger('services');
var config = require('./config')

var http = require('http'),
    Faye = require('faye'),
    PORT = config.SERVERS.MQ_SERVER_PORT

var server = http.createServer(),
    bayeux = new Faye.NodeAdapter({mount: '/events'});

bayeux.on('subscribe', function (clientId, channel) {
    console.log('[SUBSCRIBE] ' + clientId + ' -> ' + channel);
});

bayeux.on('unsubscribe', function (clientId, channel) {
    console.log('[UNSUBSCRIBE] ' + clientId + ' -> ' + channel);
});

bayeux.on('disconnect', function (clientId) {
    console.log('[DISCONNECT] ' + clientId);
});

bayeux.attach(server);
server.listen(PORT);

logger.info('message_server', PORT)