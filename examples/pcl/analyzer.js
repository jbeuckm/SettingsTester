
exports.analyze = function(command, set_combination, arg_combination, stdout, stderr) {

  var result;
  try {

      var parts = set_combination[0].split('/');
      var model_file = parts[parts.length-1];
      var model = parseInt(model_file.replace('.pcd',''));

      parts = set_combination[1].split('/');
      var scene_file = parts[parts.length-1].replace('.pcd','');
      var scene_parts = scene_file.split('_');
      var scene = [];
      for (var i=0; i<scene_parts.length; i++) {
	  scene.push(parseInt(scene_parts[i]));
      }

    result = JSON.parse(stdout);

    var fitness;


      var modelInScene = false;
    if (scene.indexOf(model) != -1) { // model is in the scene
      fitness = 2 * result.instances;
	modelInScene = true;
    }
    else { // // model is NOT in the scene
      if (result.instaces == 0) {
        fitness = .5; // award non-false-positive
      }
      else {
        fitness = -result.instances; // punish false-positive
      }
    }

    if (result.model_keypoints > 10) {
	var multiplier;
     
	if (modelInScene) {
	    multiplier = .3;
	}
	else {
	    multiplier = .1;
	}
 fitness += multiplier * result.correspondences/result.model_keypoints;
    }

    return {
	modelInScene: modelInScene,
        instances: result.instances,
	fitness: fitness
    };

  }
  catch (e) {
    console.warn(e);
    console.warn(stdout);

      return { fitness: 0 };
  }

};

