
exports.analyze = function(command, args, stdout, stderr) {

  console.log(stdout);

  return {
    fitness: stdout.split('').length
  };

};

