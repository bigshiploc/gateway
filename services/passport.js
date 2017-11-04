var passport = require('passport')
    , LocalPassport = require('passport-local');

var rp = require('request-promise');
rp = rp.defaults({json: true});


const config = require('../config')
var HOST = 'http://127.0.0.1:' + config.SERVERS.WEB_SERVER_PORT

function getUser(username) {
  return rp({uri: HOST + '/users'+username})
}

module.exports = function () {
  passport.use('local', new LocalPassport(function (username, password, done) {
      getUser('?username='+username).then(function (results) {
      if (results[0].password != password) {
        return done(null, false);
      }
      return done(null, results[0]);
    }).catch(function (err) {
      console.log(err)
    })

  }));

  passport.serializeUser(function (user, done) {
    console.log(user)
    if (user) {return done(null, user.id);
    }
  });

  passport.deserializeUser(function (id, done) {
    console.log(id)
    getUser('?id='+id).then(function (results) {
      console.log(results)
      if(results.length==0){
        return done(null, false);
      }
      done(null, results);
    }).catch(function (err) {
      console.log(err)
    })
  });
};