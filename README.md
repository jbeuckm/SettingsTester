Evo
==============

Test a command with different arguments repeatedly to maximize your fitness function on the command's output.

[![Build Status](https://travis-ci.org/jbeuckm/evo.png)](https://travis-ci.org/jbeuckm/evo)

##Usage##
1. Write a JSON file to configure a command and possible arguments to try.
2. Write a <a href="http://en.wikipedia.org/wiki/Fitness_function">fitness function</a> that grades the result of your command.
3. Run evo.js to see the results of your command and arguments.

###config.json###

A JSON file configures the test runner:

```javascript
{
    "command": "my_exec", // the command to run

    "arguments": { // list of named command line arguments
                   // in the order they will appear on the command line

      "k type": {
        "type": "option", // discrete set of possible options to try
        "prefix": "-k", // this argument will be run as "-k <value>"
        "values": ["small", "big", "other"] // test values for this argument
      },

      "int arg": {
        "type": "integer",
        "range": [2, 8] // test ints between 2 and 8 inclusive
      },

      "input file": {
        "type": "path",
        "path": "*.*" // test with all files in this directory
      }

    }
}
```

###analyzer.js###

A commonjs module that implements a fitness function to analyze the test command's result.

```javascript
exports.analyze = function(command, args, stdout, stderr) {

  var fitness_score = xxx; // analyze output for fitness of the test results

  return {
    my_measurement: yyy, // add any other usefull measurements to be recorded in the results
    fitness: fitness_score // "fitness" tells evo which sets of arguments are best
  };

};
```

