
exports.analyze = function(command, set_combination, arg_combination, stdout, stderr) {

  var result;
  try {
    result = JSON.parse(stdout);

    var fitness = result.instances;
    if (model_keypoints > 10) {
      fitness += .1 * result.correspondences/result.model_keypoints;
    }

    return {
      fitness: fitness
    };

  }
  catch (e) {
    console.warn(e);
    console.warn(stdout);

      return { fitness: 0 };
  }

};

