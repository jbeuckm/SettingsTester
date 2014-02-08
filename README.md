Evo
==============

Test a command with different arguments repeatedly to maximize your fitness function on the command's output.

###config.js###

A JSON file configures the test runner:

```javascript
{
    "command": "ls", // the command to run

    "arguments": { // list of command line arguments

      "mode": {
        "type": "option", // discrete set of possble options to try
        "prefix": ["", "-a", "-l", "-al"]
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

