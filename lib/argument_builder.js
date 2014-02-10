var glob = require('glob');

var ArgumentBuilder = function(name, config) {

  this.name = name;
  this.config = config;

};

ArgumentBuilder.prototype.build = function(){

  var index = Math.floor(Math.random() * this.config.prefix.length);

  return this.config.prefix[index];
};

ArgumentBuilder.prototype.domain = function(){

  switch (this.config.type) {

    case "path":
      var files = glob.sync(this.config.path);
      if (files.length == 0) {
        console.warn("no files found matching "+this.config.path);
        return ["<"+this.name+">"];
      }
      else {
        return files;
      }
      break;

    case "float":
      var domain = [];

      domain.push(this.config.range[0]);
      domain.push(this.config.range[1]);

      return domain;
      break;

    case "integer":
      var domain = [];
      for (var i=this.config.range[0]; i<=this.config.range[1]; i++) {
        domain.push(i);
      }
      return domain;
      break;

    case "option":
    default:
      return this.config.values;
      break;

  }
};

/**
 * Combine the given traits genetically
 */
ArgumentBuilder.prototype.mate = function(traits) {

    //pick one of the parents
    var index = Math.floor(Math.random() * traits.length);

    switch(this.config.type) {

    case "path":
    case "option":
	return traits[index];
	break;

    case "float":
	// half the time, just pick a parent
	if (Math.random() < .5) return traits[index];

        var sum = 0;
        for (var i=0; i<traits.length; i++) {
	    sum += traits[i];
	}
        return sum / traits.length;
	break;

    case "integer":
	// half the time, pick a parent
	if (Math.random() < .5) return traits[index];

        var sum = 0;
        for (var i=0; i<traits.length; i++) {
	    sum += traits[i];
	}
        return Math.round(sum / traits.length);
	break;

    }
};


exports.getInstance = function(name, config) { return new ArgumentBuilder(name, config); };
