#!/usr/bin/env node

var program = require('commander');
var cp = require('child_process');
var fs = require('fs');


program
  .version('0.0.1')
    .option('-c, --config [json file]', 'JSON file that configures the test', "config.js")
    .option('-a, --analyzer [js function file]', 'File containing a Javascript function that grades the output of the command')
  .parse(process.argv);

if (!program.config) {
    console.log("You must supply a config file.");
    process.exit(-1);
}

// load the analyzer function that will grade the output of the command
var analyze;
if (program.analyzer) {
    fs.readFile(program.analyzer, 'utf8', function (err, data) {
	if (err) {
	    return console.log(err);
	}
	eval(data);
	readConfigFile();
    });
}
else {
    readConfigFile();
}

var config;
function readConfigFile() {
    // read config file
    fs.readFile(program.config, 'utf8', function (err,data) {
	if (err) {
	    return console.log(err);
	}
	config = JSON.parse(data);
	runTest(config, analyze);
    });
}

function runTest(config, analyzer) {
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
	if (analyze) {
	    console.log(analyze(data));
	}
	else {
	    console.log(data);
	}
    });

    ps.stderr.on('data', function(data){
	console.log(data);
    });

    ps.on('close', function (code) {
	console.log('ps process exited with code ' + code);
    });
}

