const path = require('path')

const MQ_SERVER_PORT = 8001
const MQ_SERVER_BASE = 'http://localhost:' + MQ_SERVER_PORT + '/'

exports.SERVERS = {
    MQ_SERVER: MQ_SERVER_BASE + 'events',
    ES_SERVER: 'localhost:9200',
    MQ_SERVER_PORT: MQ_SERVER_PORT,
    MQ_SERVER_BASE: MQ_SERVER_BASE,
    // WEB_SERVER_PORT: 8080,
    WEB_SERVER_PORT: 9000,
    SIO_WRAPPER_IP: 'localhost',
    SIO_WRAPPER_PORT: 3000,
    RAW_SERVER_IP: 'localhost',
    RAW_SERVER_PORT: 8899,
}

exports.DIR = {
    DATA_DIR: __dirname+'/log',
    get LOG_RAW() {
        return path.join(this.DATA_DIR, 'raw.log')
    },
    get LOG_SERVICE() {
        return path.join(this.DATA_DIR, 'service.log')
    },
    get LOG_FRAME() {
        return path.join(this.DATA_DIR, 'frame.log')
    },
    get DATA_RAW_DIR() {
        return path.join(this.DATA_DIR, 'raw')
    },
    get DATA_FRAME_DIR() {
        return path.join(this.DATA_DIR, 'frame')
    },
    get DATA_RESULT_DIR() {
        return path.join(this.DATA_DIR, 'result')
    },
}


exports.EVENTS = [
    'status',
    'uwbbase_stat',
    'user_uwb',
    'user_stat',
    'rtkres_attitude',
    'rtkres_basepos',
    'rtkres_baseobs',
    'rtkres_roverpos',
    'rtkres_roverobs',
]