var login = require('../app/login.js');
var chai = require('chai');
var should = chai.should();

describe('Authenticate user', function () {
    var connectionString = "mongodb://localhost:27017/";
    var dbName = "Login";
    var collectionName = "TEST";
    var username = "Akshay";
    var password = "1234";

    it('authenticate user', function (done) {
        login.create(connectionString, dbName, collectionName, username, password, function (err, data) {
            if (err) {
                console.error(err);
            }
            console.error(data);
            done();
        });
    });

});