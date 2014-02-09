var fs = require('fs');
var ab = require('./argument_builder.js');


exports.readConfigFile = function(configFile, callback) {

  // read config file
  fs.readFile(configFile, 'utf8', function (err, data) {

    if (err) {
      callback(err);
    }

    var config = JSON.parse(data);

    exports.readConfig(config, callback);
  });

};


exports.readConfig = function(config, callback) {

  var command, set_builders=[], arg_builders=[];

  command = config.command;

  for (var i in config.arguments) {

    var arg = config.arguments[i];

    if (arg.test_set) {
      set_builders.push(ab.getInstance(i, arg));  // build the test set with this argument - typically a data file
    }
    else {
      arg_builders.push(ab.getInstance(i, arg));  // maximize fitness with this argument
    }
  }

  callback(null, command, set_builders, arg_builders);
};
