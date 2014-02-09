

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

    builder.readConfig(config, function(err, command, args_builder, test_builder) {
      expect(command).toEqual("test");
      expect(args_builder.length).toEqual(1);
      expect(test_builder.length).toEqual(1);
    });

  });

});
