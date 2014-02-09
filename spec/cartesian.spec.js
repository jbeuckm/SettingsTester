var cartesian = require('../lib/cartesian.js');

describe("Cartesian", function() {

  it("generates cartesian product", function() {

    var a = ["one", "two"], b = [3,4,5], c = [true, false];

    var product = cartesian.product([a,b,c]);

    expect(product.length).toEqual(12);

  });

});
