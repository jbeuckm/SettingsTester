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
      }
      return files;
      break;

    case "float":
      var domain = [];

      var option = "";
      if (this.config.prefix) {
        option += this.config.prefix + " "
      }
      domain.push(option + this.config.range[0]);
      domain.push(option + this.config.range[1]);

      return domain;
      break;

    case "integer":
      var domain = [];
      for (var i=this.config.range[0]; i<=this.config.range[1]; i++) {
        var option = "";
        if (this.config.prefix) {
          option += this.config.prefix + " "
        }
        domain.push(option + i);
      }
      return domain;
      break;

    case "option":
    default:
      var domain = [];
      for (var i=0; i<this.config.values.length; i++) {
        var option = "";
        if (this.config.prefix) {
          option += this.config.prefix + " "
        }
        domain.push(option + this.config.values[i]);
      }
      return domain;
      break;

  }
};


exports.getInstance = function(name, config) { return new ArgumentBuilder(name, config); };
