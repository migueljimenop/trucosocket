var utils = require('./utils');
var expect = require("chai").expect;
var User = require("../models/user.js");

describe('Users: models', function () {
  describe('#create()', function () {
    it('should create a new User', function (done) {
      // Create a User object to pass to User.create()
      var u = {
        username: 'spiderman',
        password: 'asdfasdf'
      };
      User.create(u, function (err, createdUser) {
        // Confirm that that an error does not exist
        console.log(err)
        expect(err).to.not.exist

        // verify that the returned user is what we expect
        expect(createdUser.username).to.be.eq('spiderman');

        // Call done to tell mocha that we are done with this test
        done();
      });
    });
  });
});
