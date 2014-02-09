Evo
==============

Test a command with different arguments repeatedly to maximize your fitness function on the command's output.

###config.js###

A JSON file configures the test runner:

```javascript
{
    "command": "ls", // the command to run

    "arguments": { // list of named command line arguments 
                   // in the order they will appear on the command line

      "mode": {
        "type": "option", // discrete set of possible options to try
        "prefix": "-k", // this argument will be run as "-k <value>"
        "values": ["small", "big", "other"] // test values for this argument
      },

      {
        "type": "integer",
        "range": [2, 8] // test ints between 2 and 8 inclusive
      },

      {
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
    my_measurement: yyy,
    fitness: fitness_score
  };

};
```

