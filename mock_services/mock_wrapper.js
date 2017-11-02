/**
 * Created by xiaopingfeng on 10/5/17.
 */
/**
 * Created by xiaopingfeng on 9/12/17.
 */
var fs = require('fs')
var readline = require('readline')

var lines = []
var myInterface = readline.createInterface({
  input: fs.createReadStream('test/result/1507620014694_514.user_uwb', 'utf8')
});
myInterface.on('line', function (line) {
  // var data = Buffer.from(line, 'base64')
  var data = line
  lines.push(data)
});
myInterface.on('close', function () {
  console.log('mock_services up data ready')

  var socket = require('socket.io-client')('http://127.0.0.1:3000');
  socket.on('connect', function () {
    console.log('connected!')
    var i = 0
    var task = setInterval(function () {
      i++
      if (lines[i]) {
        var result = lines[i]
        var data = JSON.parse(result)
        result = JSON.stringify(data)
        socket.emit('user_uwb', result)
      }

      if (i == lines.length) {
        console.log('complete')
        clearInterval(task)
      }
    }, 1000)

  });
  socket.on('raw', function (data) {
    // console.log('raw', data)
    //     var display = data.length + ':'
    //     for(var i =0; i<data.length;i++){
    //         display += data[i].toString(16)+ ' '
    //     }
    //     console.log(display)

  });
  socket.on('disconnect', function () {
    console.log('disconnect')
  });
})
