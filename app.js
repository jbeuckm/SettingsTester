var cp = require('child_process');
var fs = require('fs');

console.log('starting');

var ps = cp.spawn('ls', ['-al']);

ps.stderr.setEncoding('utf8');
ps.stdout.setEncoding('utf8');

ps.stdout.on('data', function(data){
    console.log(data);
});

ps.stderr.on('data', function(data){
    console.log(data);
});

ps.on('close', function (code) {
  console.log('ps process exited with code ' + code);
});

