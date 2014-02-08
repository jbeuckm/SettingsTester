#!/usr/bin/env node

var program = require('commander');
var cp = require('child_process');
var fs = require('fs');


program
  .version('0.0.1')
    .option('-c, --config [json file]', 'JSON file that configures the test', "config.js")
//  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
  .parse(process.argv);

if (!program.config) {
    console.log("You must supply a config file.");
    process.exit(-1);
}

// read config file
fs.readFile(program.config, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
    var config = JSON.parse(data);
    console.log(config);
    processConfig(config);
});


function processConfig(config) {
    // build command line arguments
    var commandPath = config.command;
    var args = [];
    for (var i in config.arguments) {

	args.push(i);

	if (config.arguments[i] !== null) {
	    args.push(config.arguments[i]);
	}

    }

    var ps = cp.spawn(commandPath, args);

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
}

