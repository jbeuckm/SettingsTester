
exports.analyze = function(command, combination, stdout, stderr) {

  var resp =  {
    fitness: (stdout)? stdout.split('').length : 0
  };

  return resp;
};

