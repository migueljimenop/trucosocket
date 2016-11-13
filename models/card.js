var _ = require('lodash');

/*
* Matrix used to calculate the card weight in the Truco game
*   weigth -  card
*      13  -  1 espada
*      12  -  1 basto
*      11  -  7 espada
*      10  -  7 oro
*       9  -  3
*       8  -  2
*       7  -  1 copa
*       7  -  1 oro
*       6  -  12
*       5  -  11
*       4  -  7 copa
*       4  -  7 basto
*       3  -  6
*       2  -  5
*       1  -  4
*/
var weight = {
  //        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10,11,12]
  'oro':    [0, 7, 8, 9, 1, 2, 3,10, 0, 0, 0, 5, 6],
  'copa':   [0, 7, 8, 9, 1, 2, 3, 4, 0, 0, 0, 5, 6],
  'espada': [0, 13,8, 9, 1, 2, 3,11, 0, 0, 0, 5, 6],
  'basto':  [0, 12,8, 9, 1, 2, 3, 4, 0, 0, 0, 5, 6]
};

/*
 * This is the Card Object
 *   @number: the number representing the card number
 *   @suit: this is the card suit
 */
function Card(number, suit){
  this.number = number;
  this.suit = suit;
  this.weight = weight[suit][number];
};

/*
 *  Print a card
 */
 
Card.prototype.show = function(){
  return this.number + "-" + this.suit;
};

/*
 * Compares two cards
 *   @card: the card to compare this
 *
 * Returns:
 *   1 if this card is better than 'card',
 *   0 if are equal and
 *   -1 if it's worst
 */
Card.prototype.confront = function(card){
  if(this.weight > card.weight)
    return 1;
  else if(this.weight == card.weight)
    return 0;
  else if(this.weight < card.weight)
    return -1;
};

/*
 * Returns the envido points of two cards 'this' and 'card'
 */
Card.prototype.envido = function(card) {
  var cardValue = card.isBlackCard() ? 0 : card.number;
  var thisValue = this.isBlackCard() ? 0 : this.number;

  if(!this.isSameSuit(card))
    return _.max([cardValue, thisValue]);

  else if (card.isBlackCard() && this.isBlackCard())
    return 20;

  else
    return cardValue + thisValue + 20;
};

/*
 * Returns true if card is number 11 or 12
 */
Card.prototype.isBlackCard = function(){
  return this.number == 11 || this.number == 12;
};

/*
 * Returns true when this has the same suit than @card
 */
Card.prototype.isSameSuit = function(card){
  return this.suit == card.suit;
};

module.exports.card = Card;
