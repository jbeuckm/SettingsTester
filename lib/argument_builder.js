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
      return glob.sync(this.config.path);
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
      return this.config.prefix;
      break;

  }
};


exports.getInstance = function(name, config) { return new ArgumentBuilder(name, config); };
