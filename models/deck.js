var _ = require('lodash');
var cardModel = require('./card');

// Here we are importing card model, later we will use it to create a Deck
var Card = cardModel.card;

/*
 * Suit of Spanish deck
 */
var suits = ['oro', 'copa', 'espada', 'basto'];

/*
 * Number of cards used in Truco game
 */
var cardNumbers = [1, 2, 3, 4, 5, 6, 7, 11, 12];

/*
 * Constructor
 */
function Deck(){ 
}

/*
 * Returns a Spanish Deck sorted
 */
Deck.prototype.sorted = function(){
  return _.flatten( _.map(suits, function(suit){
                      return _.map(cardNumbers, function(number){
                        return new Card(number, suit);
                      });
                    }));
};

/*
 * Mix a sorted deck
 */
Deck.prototype.mix = function(){
  //console.log(this.sorted());
  return _.shuffle(this.sorted());
};

module.exports.deck = Deck;