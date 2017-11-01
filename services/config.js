const MQ_SERVER_PORT = 8001
const MQ_SERVER_BASE = 'http://localhost:' + MQ_SERVER_PORT + '/'

exports.SERVERS = {
    MQ_SERVER: MQ_SERVER_BASE + 'events',
    ES_SERVER: 'localhost:9200',
    MQ_SERVER_PORT: MQ_SERVER_PORT,
    WEB_SERVER_PORT: 8080,
    // WEB_SERVER_PORT: 9000,
    SIO_WRAPPER_PORT: 3000,
    RAW_SERVER_PORT: 8899,
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