
exports.analyze = function(command, args, stdout, stderr) {

  return {
    fitness: stdout.split('').length
  };
};

