var fs = require('fs');
var ab = require('./argument_builder.js');
var cartesian = require('./cartesian.js');


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

  callback(null, config, command, set_builders, arg_builders);
};


exports.buildCombinations = function(builders) {

  var domains = [];

  for (var i= 0, l=builders.length; i<l; i++) {
    domains.push(builders[i].domain());
  }

  var combinations = cartesian.product(domains);

  return combinations;
};


exports.shuffle = function(o){ //v1.0
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};


exports.buildTestSet = function(config, set_combinations) {

  if (!config.testing || !config.testing.test_size) {
    return set_combinations;
  }

  if (set_combinations.length <= config.testing.test_size) {
    return set_combinations;
  }

  var set = [];
  for (var i=0; i<config.testing.test_size; i++) {
    var index = Math.floor(Math.random() * set_combinations.length);
    set.push(set_combinations[index]);
  }

  return set;
};

