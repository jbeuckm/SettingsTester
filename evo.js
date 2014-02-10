#!/usr/bin/env node

var program = require('commander');
var cp = require('child_process');

var testBuilder = require('./lib/test_builder.js');

program
  .version('0.1')
  .option('-c, --config [json file]', 'test configuration file', 'config.json')
  .option('-a, --analyzer [js file]', 'fitness function for command output', 'analyzer.js')
  .option('-t, --test', 'just echo a few example commands to verify config')
  .option('-s, --sorted', 'test combinations in order (random order by default)')
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

  testBuilder.readConfigFile(program.config, function (err, _config, _command, _set_builders, _arg_builders) {
    config = _config;
    command = _command;
    set_builders = _set_builders;
    arg_builders = _arg_builders;

    buildTests();
  });

}


function getRandomCombination(combinations) {
  var index = Math.floor(Math.random() * combinations.length);
  return combinations[index];
}


function buildTests() {

  var set_combinations = testBuilder.buildCombinations(set_builders);
  var arg_combinations = testBuilder.buildCombinations(arg_builders);

  if (!program.sorted) {
    set_combinations = testBuilder.shuffle(set_combinations);
    arg_combinations = testBuilder.shuffle(arg_combinations);
  }

  // test mode - just output up to five rows
  if (program.test) {
    outputTestCommands(set_combinations, arg_combinations);
  }
  else {

    if (config.testing) {

      buildAndTestPopulation(set_combinations, arg_combinations);

    }
    else {

      var test_set_combinations = testBuilder.buildTestSet(config, set_combinations);
      runTestSet(test_set_combinations, arg_combinations.shift(), function (err, results) {
        console.log(results);
      });

    }
  }

}


function buildAndTestPopulation(set_combinations, arg_combinations) {

  var seedPopulation = [];

  for (var i = 0; i < config.testing.population; i++) {

    var specimen = {
      arguments: getRandomCombination(arg_combinations)
    };

    seedPopulation.push(specimen);

  }

  function runGeneration(population) {

    // build a set from the test pool to test this population
    var test_set = testBuilder.buildTestSet(config, set_combinations);

    testPopulation(population, test_set, function (err, results) {

      if (err) {
        console.warn(err);
      }
      else {

        population.sort(function (a, b) {
          return b.fitness - a.fitness;
        });

        var parents = population.slice(0, config.testing.generators);

        var children = generate(parents, config.testing.population - config.testing.wildcards);
        for (var i = 0; i < config.testing.wildcards; i++) {
          children.push({
            arguments: getRandomCombination(arg_combinations)
          });
        }

        runGeneration(children);
      }
    });
  }

  runGeneration(seedPopulation);
}


/**
 * Combine parents genetically to produce <count> children
 */
function generate(parents, count) {

  var children = [];
  var argument_count = parents[0].arguments.length;

  for (var i = 0; i < count; i++) {
    var child = { arguments: [] };

    for (var j = 0; j < argument_count; j++) {

      var parent_traits = [];
      for (var k = 0; k < parents.length; k++) {
        parent_traits.push(parents[k].arguments[j]);
      }

      var parent_traits = parents.map(function (d) {
        return d.arguments[j];
      });

      var builder = arg_builders[j];

      child.arguments.push(builder.mate(parent_traits));
    }

    children.push(child);
  }
  return children;
}


function testPopulation(population, test_set, callback) {

  var specimenIndex = 0;
  var results = [];

  function testNextSpecimen() {

    if (specimenIndex >= population.length) {
      callback(null, results);
      return;
    }

    var specimen = population[specimenIndex++];

    testSpecimen(specimen, test_set, function (err, testResults) {

      if (err) {
        callback(err);
        return;
      }

      console.log(specimen);

      results.push(testResults);

      testNextSpecimen();
    });

  }

  testNextSpecimen();
}


function testSpecimen(specimen, test_set, callback) {

  if (!specimen) {
    callback("empty specimen");
  }

  // run the test
  runTestSet(test_set, specimen.arguments, function (err, results) {

    if (err) {
      callback(err);
      return;
    }

    // record the result
    var sum = 0;
    for (var i = 0; i < results.length; i++) {
      sum += results[i].fitness;
    }
    specimen.fitness = sum / results.length;

    callback(null, results);

  });

}


/**
 *  Run these arguments with all combinations of the test set.
 *
 * @param test_set_combinations
 * @param arg_combination
 */
function runTestSet(test_set_combinations, arg_combination, callback) {

  var testSetIndex = 0;
  var results = [];

  function runNextTest() {

    if (test_set_combinations.length <= testSetIndex) {
      callback(null, results);
      return;
    }

    var set_combination = test_set_combinations[testSetIndex++];

    runTest(command, set_combination, arg_combination, function (err, analysis) {

      if (err) {
        console.warn(err);
        runNextTest();
      }
      else {

        results.push({
          duration: analysis.duration,
          fitness: analysis.fitness
        });

        var report = [analysis.duration, filenameFromPath(command)];
        delete analysis.duration;

        if (set_combination)
          for (var j = 0, m = set_combination.length; j < m; j++) {

            var set_item = set_combination[j];
            if (set_builders[j].config.type == "path") {
              set_item = filenameFromPath(set_item);
            }
            report.push(set_item);
          }

        for (var j = 0, m = arg_combination.length; j < m; j++) {
          report.push(arg_combination[j]);
        }

        for (var j in analysis) {
          report.push(analysis[j]);
        }

        console.log(report.join('\t'));
      }

      runNextTest();
    });

  }

  runNextTest();
}


function outputTestCommands(set_combinations, arg_combinations) {

  var set_demo_indices = [];
  for (var i = 0; i < 5; i++) {
    set_demo_indices.push(Math.floor(Math.random() * (set_combinations.length % set_combinations.length)));
  }

  var arg_demo_indices = [];
  for (var i = 0; (i < 5 && i < arg_combinations.length); i++) {
    arg_demo_indices.push(Math.floor(Math.random() * arg_combinations.length));
  }

  for (var i = 0; i < arg_demo_indices.length; i++) {

    var prefixed = prefixCombination(set_combinations[set_demo_indices[i]], arg_combinations[arg_demo_indices[i]]);

    console.log(filenameFromPath(command) + " " + prefixed.join(" "));
  }
}


function filenameFromPath(path) {
  var parts = path.split('/');

  return parts[parts.length - 1];
}


/**
 * Build command line from test set and argument combinations, adding prefixes if they appear in config.
 *
 * @param arg_combination
 * @return {Array}
 */
function prefixCombination(set_combination, arg_combination) {

  var prefixedArgs = [];

  if (set_combination) {
    for (var i = 0, l = set_combination.length; i < l; i++) {

      if (set_builders.length == 0) continue;
      if (set_combination[i] === null) continue;

      if (set_builders[i].config.prefix) {
        prefixedArgs.push(set_builders[i].config.prefix);
      }
      prefixedArgs.push(set_combination[i]);
    }
  }

  if (arg_combination) {
    for (var i = 0, l = arg_combination.length; i < l; i++) {

      if (arg_combination[i] === null) continue;

      if (arg_builders[i].config.prefix) {
        prefixedArgs.push(arg_builders[i].config.prefix);
      }
      prefixedArgs.push(arg_combination[i]);
    }
  }

  return prefixedArgs;
}


function runTest(command, set_combination, arg_combination, callback) {

  var startTime = (new Date()).getTime();

  var prefixedArgs = prefixCombination(set_combination, arg_combination);
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
    console.log("error " + code);
    callback(code);
  });
  ps.on('disconnect', function (code) {
    console.log("disconnect " + code);
    callback(code);
  });

  ps.on('close', function (code) {
//    finish(code);
  });

  ps.on('exit', function (code) {
    finish(code);
  });

  function finish(code) {

    var endTime = (new Date()).getTime();

    var analysis = fitness.analyze(command, set_combination, arg_combination, output, err);

    analysis.duration = endTime - startTime;

    if (code != 0) {
      callback("error: " + err);
    }
    else {
      callback(null, analysis);
    }
  }

}

