var expect = require("chai").expect;
var cardModel = require("../models/card.js");

var Card = cardModel.card;

describe('Card', function() {

  describe("properties", function(){
    it('should have a suit property', function(){
      var c = new Card(1, 'oro');
      expect(c).to.have.property('suit');
    });

    it('should have a number property', function(){
      var c = new Card(1, 'oro');
      expect(c).to.have.property('number');
    });
  });


  describe("#show", function(){
    it('should returns card', function(){
      var c = new Card(1, 'copa');
      expect(c.show()).to.be.eq("1-copa");
    });
  });

  describe("#confront", function(){
    var c = new Card(1, 'espada');
    var x = new Card(4, 'basto');
    var y = new Card(4, 'oro');
         
    describe("when this is better than argument", function(){
      it("should returns 1", function(){
        expect(c.confront(x)).to.be.eq(1);
      })
    });

    describe("when this is worst than argument", function(){
      it("should returns -1", function(){
        expect(x.confront(c)).to.be.eq-(1);
      })
    });

    describe("when this is better than argument", function(){
      it("should returns 1", function(){
        expect(y.confront(x)).to.be.eq(0);
      })
    });
  });
});