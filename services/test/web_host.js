/**
 * Created by xiaopingfeng on 10/5/17.
 */
var logger = require('log4js').getLogger('services')

var PORT = require('./config').SERVERS.WEB_SERVER_PORT
var express = require('express');
var path = require('path');
var app = express();
var static_path = path.join(__dirname, '../public')
app.use(express.static(static_path));

require('./api')(app)

var server = require('http').createServer(app);
server.listen(PORT);

logger.info('web_server', PORT)