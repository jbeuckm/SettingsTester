#!/usr/bin/env node

var program = require('commander');
var cp = require('child_process');
var fs = require('fs');
var ab = require('./lib/argument_builder.js');
var testBuilder = require('./lib/test_builder.js');

program
  .version('0.1')
  .option('-c, --config [json file]', 'test configuration file', 'config.json')
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

var config;
var command;
var set_builders = [];
var arg_builders = [];


function readConfigFile() {

  testBuilder.readConfigFile(program.config, function(err, _config, _command, _set_builders, _arg_builders) {
    config = _config;
    command = _command;
    set_builders = _set_builders;
    arg_builders = _arg_builders;

    buildTests();
  });

}



function buildTests() {

  testBuilder.buildCombinations(arg_builders, set_builders, function(err, set_combinations, arg_combinations){

    if (!program.sorted) {
      set_combinations = testBuilder.shuffle(set_combinations);
      arg_combinations = testBuilder.shuffle(arg_combinations);
    }

    // test mode - just output up to five rows
    if (program.test) {
      outputTestCommands(set_combinations, arg_combinations);
    }
    else {
      runTestSet(arg_combinations);
    }

  });


}


function runTestSet(set_combinations, arg_combinations) {

  function runNextTest() {

    if (arg_combinations.length == 0) {
      return;
    }

    var combination = arg_combinations.shift();

    runTest(command, combination, function(err, analysis){

      if (err) {
        console.warn(err);
        runNextTest();
        return;
      }

      var report = analysis.duration+"ms\t"+command + "\t";
      delete analysis.duration;

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


function outputTestCommands(set_combinations, arg_combinations) {
  var arg_demo_indices = [];

  for (var i=0; (i<5 && i<arg_combinations.length); i++) {
    arg_demo_indices.push(Math.floor(Math.random() * arg_combinations.length));
  }

  for (var i=0; i<arg_demo_indices.length; i++) {
    var prefixedArgs = prefixCombination(arg_combinations[arg_demo_indices[i]]);
    console.log(command + " " + prefixedArgs.join(" "));
  }
}


/**
 * When a builder has a prefix, push it into the args
 *
 * @param combination
 * @return {Array}
 */
function prefixCombination(combination) {

  var prefixedArgs = [];
  for (var i= 0, l=combination.length; i<l; i++) {

    if (combination[i] === null) continue;

    if (arg_builders[i].config.prefix) {
      prefixedArgs.push(arg_builders[i].config.prefix);
    }
    prefixedArgs.push(combination[i]);
  }
  return prefixedArgs;
}

function runTest(command, combination, callback) {

  var startTime = (new Date()).getTime();

  var prefixedArgs = prefixCombination(combination);
  var ps = cp.spawn(command, prefixedArgs);

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

  ps.on('error', function (code) {
    console.log("error "+code);
    callback(code);
  });
  ps.on('disconnect', function (code) {
    console.log("disconnect "+code);
    callback(code);
  });

  ps.on('close', function(code){
//    finish(code);
  });

  ps.on('exit', function (code) {
    finish(code);
  });

  function finish(code) {

    var endTime = (new Date()).getTime();

    var analysis  = fitness.analyze(command, combination, output, err);

    analysis.duration = endTime - startTime;

    if (code != 0) {
      callback("error: "+err);
    }
    else {
      callback(null, analysis);
    }
  }

}

