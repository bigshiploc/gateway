var path = require('path')

var config = require('./config')

require('./services/message_server')
require('./mock_services/mock_faye')(
    config,
    path.join(__dirname+'/data/', 'result')
)