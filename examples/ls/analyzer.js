
exports.analyze = function(command, set_combination, arg_combination, stdout, stderr) {

  var resp =  {
    fitness: (stdout)? stdout.split('').length : 0
  };

  return resp;
};

