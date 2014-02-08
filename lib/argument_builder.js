var ArgumentBuilder = function(name, config) {

  this.name = name;

  this.config = config;

  console.log("init() for argument "+name);
};

ArgumentBuilder.prototype.build = function(){

  var index = Math.floor(Math.random() * this.config.prefix.length);

  return this.config.prefix[index];
};

exports.getInstance = function(name, config) { return new ArgumentBuilder(name, config); };
