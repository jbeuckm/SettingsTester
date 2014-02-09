
exports.analyze = function(command, set_combination, arg_combination, stdout, stderr) {

  return {
    fitness: stdout.split('').length
  };
};

