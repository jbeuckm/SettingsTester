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


exports.getInstance = function(name, config) { return new ArgumentBuilder(name, config); };
