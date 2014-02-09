
var ab = require('../lib/argument_builder.js');

describe("Argument Builder", function() {

  var config = {
    "type": "option",
    "values": [1, 2, 3]
  };

  var builder;

  beforeEach(function(){

    builder = ab.createInstance("test", config);

  });

  it("creates a new builder", function() {

    expect(builder).not.toBeNull();

  });

});
