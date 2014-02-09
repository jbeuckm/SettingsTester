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

  callback(null, command, set_builders, arg_builders);
};


exports.buildCombinations = function(arg_builders, test_builders, callback) {

  var arg_domains = [], test_domains = [];

  for (var i= 0, l=arg_builders.length; i<l; i++) {
    arg_domains.push(arg_builders[i].domain());
  }

  var arg_combinations = cartesian.product(arg_domains);


  for (var i= 0, l=test_builders.length; i<l; i++) {
    test_domains.push(test_builders[i].domain());
  }

  var test_combinations = cartesian.product(test_domains);


  callback(null, test_combinations, arg_combinations);

};



function shuffle(o){ //v1.0
  for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
  return o;
};
