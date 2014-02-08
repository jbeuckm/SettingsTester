exports.product = function(args) {

//  var args = [].slice.call(arguments)
  var end  = args.length - 1;

  var result = [];

  function addTo(curr, start) {
    var first = args[start]
      , last  = (start === end);

    for (var i = 0; i < first.length; ++i) {
      var copy = curr.slice();
      copy.push(first[i]);

      if (last) {
        result.push(copy)
      } else {
        addTo(copy, start + 1)
      }
    }
  }

  if (args.length) {
    addTo([], 0)
  } else {
    result.push([])
  }

  return result;
};
