var rp = require('request-promise');
rp({
    uri: 'http://127.0.0.1:9000/getConfigInfo',
    json: true
})
    .then(function (repos) {
        console.log('User has %d repos', repos.length);
    })
    .catch(function (err) {
        // API call failed...
    });
