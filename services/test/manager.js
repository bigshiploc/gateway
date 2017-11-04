var Faye = require('faye')
var config = require('./config')
var client = new Faye.Client(config.SERVERS.MQ_SERVER)


client.publish('/worker/cmd', {
    'op': 'start',
    'worker_id': 'wrapper',
    'task_id': new Date().getTime()
})


// setInterval(function () {
//     client.publish('/worker/cmd', {
//         'op': 'start',
//         'worker_id': 'wrapper',
//         'task_id': new Date().getTime()
//     })
//     setTimeout(function () {
//         client.publish('/worker/cmd', {
//             'op': 'stop',
//             'worker_id': 'wrapper',
//         })
//     }, 3000)
// }, 10 * 1000)

client.subscribe('/worker/stat', function (message) {
    console.log(message)
})

// var sub = client.subscribe('/workers', function () {
//     console.log('')
// })
//