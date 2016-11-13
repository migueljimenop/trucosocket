/*
 * Represents a player in the game
 * @param name [String]: old state to intialize the new state
 */

var _ = require('lodash');
var mongoose = require('mongoose');
var config = require('../config');
var Schema = mongoose.Schema;
var card = require('./card');
//mongoose.connect("mongodb://localhost/truco-development");
/*
 * Player Schema
 */

var PlayerSchema = new Schema({
  playerid: {
    type: Object,
    ref: 'Player'
  },
  nickname: {
    type: String,
    required: true,
    unique: true
  },
  cards: Array,
  envidoPoints: {
    type: Number,
    default: 0,
  }
});

var Player = mongoose.model("Player", PlayerSchema);

/*
 * Add cards to user and calculate the user points
 */
Player.prototype.setCards = function(cards){
  this.cards = cards;
  this.envidoPoints = this.points();
}

/*
 * Returns the user envido points
 */
Player.prototype.points = function(){
  var pairs = [
    [this.cards[0], this.cards[1]],
    [this.cards[0], this.cards[2]],
    [this.cards[1], this.cards[2]],
  ];

  var pairValues = _.map(pairs, function(pair){
    return pair[0].envido(pair[1]);
  });

  return _.max(pairValues);
};

//module.exports = mongoose.model('Player', PlayerSchema);

module.exports.player = Player;
