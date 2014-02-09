

var builder = require('../lib/test_builder.js');

describe("Test Builder", function() {

  var config = {
    command: "test",
    arguments: {
      "arg": {
        "type": "option",
        "values": [1, 2, 3]
      },
      "file": {
        "test_set": true
      }
    }
  };

  it("reads a config file", function() {

    builder.readConfig(config, function(err, config, command, args_builders, test_builders) {
      expect(command).toEqual("test");
      expect(args_builders.length).toEqual(1);
      expect(test_builders.length).toEqual(1);
    });

  });

  it("builds test combinations", function(){

    var config = {
      arguments: {
        test: {
          test_set: true,
          type: "option",
          values: [0,1]
        },
        args: {
          type: "option",
          values: [0,1]
        }
      }
    };

    builder.readConfig(config, function(err, config, command, args_builders, test_builders) {

      builder.buildCombinations(args_builders, test_builders, function(err, test_combinations, arg_combinations){
        expect(test_combinations.length).toEqual(2);
        expect(arg_combinations.length).toEqual(2);
      });

    });

  });

  it("selects test combinations from the domain", function(){

    var config = {
      testing: {
        test_size: 5
      }
    };

    var combinations = [[0,1],[1,2],[2,3]];

    var sets = builder.buildTestSet(config, combinations);

    expect(sets.length).toEqual(3);

    combinations.push([0,0],[1,1],[2,2],[3,3]);

    sets = builder.buildTestSet(config, combinations);

    expect(sets.length).toEqual(5);

  });

});
