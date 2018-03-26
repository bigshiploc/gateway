var path = require('path')

var config = require('./config')

require('./raw_statistics')(
    config,
    path.join(__dirname+'/../2018-3-6_14_47')
)