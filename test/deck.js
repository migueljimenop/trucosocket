var expect = require("chai").expect;
var deckModel = require("../models/deck");

var Deck = deckModel.deck;

describe('Deck', function() {
  it('#sorted', function(){
    var d = new Deck();
    expect(d.sorted().length).to.be.eq(36);
  });

});

