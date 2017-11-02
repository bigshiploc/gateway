var path = require('path')

var config = require('./config')
require('./mock_services/mock_raw_pub')(
    config,
    path.join('/Users/fxp/Projects/bigship/data', 'raw')
)

// console.log(config.DIR.LOG_RAW)