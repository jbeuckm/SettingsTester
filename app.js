#!/usr/bin/env node

var program = require('commander');
var cp = require('child_process');
var fs = require('fs');
var ab = require('./lib/argument_builder.js');

program
  .version('0.0.1')
  .option('-c, --config [json file]', 'test configuration file', 'config.js')
  .option('-a, --analyzer [js file]', 'fitness function for command output', 'analyzer.js')
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

var command;
var builders = [];

function readConfigFile() {
  // read config file
  fs.readFile(program.config, 'utf8', function (err, data) {
    if (err) {
      return console.log(err);
    }
    var config = JSON.parse(data);
    command = config.command;
    for (var i in config.arguments) {
      builders.push(ab.getInstance(i, config.arguments[i]));
    }

    buildTests();

  });
}


function buildTests() {

  var args = [];
  for (var i= 0, l=builders.length; i<l; i++) {
    args.push(builders[i].build());
  }

  runTest(command, args, analyze, function(err, fitness){
    console.log(fitness);
  });
}


/**
 * Run the command, calling back with error or fitness result
 *
 * @param command
 * @param args
 * @param analyzer
 * @param callback
 */
function runTest(command, args, analyze, callback) {

  var ps = cp.spawn(command, args);

  ps.stderr.setEncoding('utf8');
  ps.stdout.setEncoding('utf8');

  var output = "";
  ps.stdout.on('data', function (data) {
      output += data;
  });

  var err = "";
  ps.stderr.on('data', function (data) {
    err += data;
  });

  ps.on('close', function (code) {
    console.log('ps process exited with code ' + code);

    if (code != 0) {
      callback(err);

    }
    else {
      callback(null, analyze(output));
    }

  });

}

