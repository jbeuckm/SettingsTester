
exports.analyze = function(command, set_combination, arg_combination, stdout, stderr) {

  var result;
  try {
    result = JSON.parse(stdout);
  }
  catch (e) {
    console.warn(e);
    console.warn(stdout);
  }

  return {
    fitness: result.instances
  };

};

