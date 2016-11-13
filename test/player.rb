var expect = require("chai").expect;
var playerModel = require("../models/player.js");
var cardModel = require("../models/card.js");

var Player = playerModel.player;
var Card = cardModel.card;

describe('Player', function() {
  it('should save a player', function(done){
    data = { name: 'juan',
              pass: 'pass',
              cards: [new Card(1, 'espada'),
                      new Card(4, 'basto'),
                      new Card(5, 'basto')],
              envidoPoints: 29 }
    var p = new Player(data);
    p.save(function(err, player){
      if(err)
        done(err)
      expect(player.name).to.be.eq(data.name);
      done();
    })
  });

  it('should recover a player', function(done){
    Player.findOne({ name: 'juan', envidoPoints: 29 }, function(err, player){
      console.log(player);
      expect(player.name).to.be.eq('juan');
      done();
    });
  });

  it('points', function(){
    data = { name: 'juan',
             pass: 'pass',
             cards: [ new Card(1, 'espada'),
                      new Card(4, 'basto'),
                      new Card(5, 'basto')]
            };
    var p = new Player(data);

    expect(p.points()).to.be.eq(29);
  });
});
