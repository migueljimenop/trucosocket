/*
 * Represents a player in the game
 * @param name [String]: old state to intialize the new state
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
mongoose.connect("mongodb://localhost/truco");
// var db = mongoose.createConnection(config.db[process.env.NODE_ENV]);
var password_validation = {
	validator: function(p){
		return this.password_confirmation == p;
	},
	message: "Las password no coinciden."
}
/*
 * User Schema
 */
var user_schema = new Schema({
	email: { type: String, required: true, unique: true },
	password: { type:String, 
			minlength:[3,"Password demasiado corta."],
			validate: password_validation }
/*
	name:String,
	username: String,
	password: String,
	age: Number,
	email: String,
	dob: Date
*/

/*
	Tipos que acepta mongoose:
	String
	Number
	Array
	Date
	Objectid
	Boolean
	Mixed
	Buffer
	
  */
});

user_schema.virtual("password_confirmation").get(function(){
	return this.p_c;

}).set(function(password){
	this.p_c = password;
});

var User = mongoose.model("User", user_schema);

module.exports.User = User;
