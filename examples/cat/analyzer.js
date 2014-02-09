
exports.analyze = function(command, combination, stdout, stderr) {

  return {
    fitness: stdout.split('').length
  };
};

