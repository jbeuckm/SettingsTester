
exports.analyze = function(command, set_combination, arg_combination, stdout, stderr) {

  var result;
  try {
    result = JSON.parse(stdout);

//    console.log(result);

  return {
    fitness: result.instances * 10 + result.correspondences/result.model_keypoints
  };

  }
  catch (e) {
    console.warn(e);
    console.warn(stdout);

      return { fitness: 0 };
  }

};

