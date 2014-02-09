
exports.analyze = function(command, combination, stdout, stderr) {

  var result;
  try {
    result = JSON.parse(stdout);
  }
  catch (e) {
    console.warn(e);
    console.warn(stdout);
  }

  return {
    fitness: stdout.split('').length
  };

};

