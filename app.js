#!/usr/bin/env node

var program = require('commander');

program
  .version('0.0.1')
  .option('-c, --config', 'JSON file that configures the test')
//  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
  .parse(process.argv);

if (!program.config) {
    console.log("You must supply a config file.");
    process.exit(-1);
}



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

