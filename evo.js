#!/usr/bin/env node

var program = require('commander');
var cp = require('child_process');
var fs = require('fs');
var ab = require('./lib/argument_builder.js');
var cartesian = require('./lib/cartesian.js');

program
  .version('0.1')
  .option('-c, --config [json file]', 'test configuration file', 'config.js')
  .option('-a, --analyzer [js file]', 'fitness function for command output', 'analyzer.js')
  .option('-t, --test', 'just echo a few example commands to verify config')
  .parse(process.argv);

if (!program.config) {
  console.log("You must supply a config file.");
  process.exit(-1);
}

// load the analyzer function that will grade the output of the command
var fitness;
if (program.analyzer) {

    fitness = require(process.cwd() + "/" + program.analyzer);

    readConfigFile();
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

  var domains = [];
  for (var i= 0, l=builders.length; i<l; i++) {
    domains.push(builders[i].domain());
  }

  var combinations = cartesian.product(domains);

  // test mode - just output up to five rows
  if (program.test) {
    outputTestCommands(combinations);
    return;
  }
  else {
    runTests(combinations);
  }
}

function runTests(combinations) {

  function runNextTest() {

    if (combinations.length == 0) {
      return;
    }

    var combination = combinations.shift();

    runTest(command, combination, function(err, analysis){

      var report = analysis.duration+"ms\t"+command + "\t";

      for (var j= 0, m=combination.length; j<m; j++) {
        report += combination[j] + "\t";
      }

      for (var j in analysis) {
        report += analysis[j] + "\t";
      }

      console.log(report);

      runNextTest();
    });

  }

  runNextTest();
}


function outputTestCommands(combinations) {
  var demoIndices = [];

  for (var i=0; (i<5 && i<combinations.length); i++) {
    demoIndices.push(Math.floor(Math.random() * combinations.length));
  }

  for (var i=0; i<demoIndices.length; i++) {
    console.log(command + " " + combinations[demoIndices[i]]);
  }
}

/**
 * Run the command, calling back with error or fitness result
 *
 * @param command
 * @param args
 * @param analyzer
 * @param callback
 */
function runTest(command, args, callback) {

  var startTime = (new Date()).getTime();

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

    var endTime = (new Date()).getTime();

    var analysis  = fitness.analyze(command, args, output, err);
    analysis.duration = endTime - startTime;

    callback(null, analysis);

  });

}

