
exports.analyze = function(command, set_combination, arg_combination, stdout, stderr) {

  var result;
  try {

    var model = parseInt(set_combination[0]);
    var scene = set_combination[1].split('_').map(parseInt);

    result = JSON.parse(stdout);

    var fitness;


    if (scene.indexOf(model) != -1) { // model is in the scene
      fitness = result.instances;
    }
    else { // // model is NOT in the scene
      if (result.instaces == 0) {
        fitness = .5; // award non-false-positive
      }
      else {
        fitness = -.5 * result.instances; // punish false-positive
      }
    }

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

