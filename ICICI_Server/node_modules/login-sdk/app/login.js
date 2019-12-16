#!/usr/bin/env node

/**
 * @author Akshay Misal
 * @version 1.0.0
 * @since 24-Nov-2018
 */
var mongo = require('mongoskin');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var TinyURL = require('tinyurl')

/**
 * @author Akshay Misal
 * @description
 * @param {connectionString, dbName, collectionName, username,password,} req 
 * @param {JSONObject} res  
 */
var authenticateUser = function (connectionString, dbName, collectionName, username, password, secret, callback) {
    try {
        var db = mongo.db(connectionString + dbName, {
            native_parser: false
        });
        db.bind(collectionName);
        var username = username;

        db.collection(collectionName).findOne({
            username: username
        }, function (err, user) {
            if (err) {
                return callback(err, "");
            }

            if (user && bcrypt.compareSync(password, user.hash)) {
                user.hash = "";
                var set = {
                    message: "Login Successful.",
                    token: jwt.sign({ sub: user._id }, secret),
                    user: user
                }
                return callback(err, set);
            } else {
                var set = {
                    message: 'Username or password is incorrect'
                }
                return callback(err, set);
            }

        })
        db.close();
    } catch (err) {
        throw err;
    }
}

/**
 * @author Akshay Misal
 * @param {*} connectionString 
 * @param {*} dbName 
 * @param {*} collectionName 
 * @param {*} username 
 * @param {*} oldPassword  
 * @param {*} newPassword
 * @param {*} confirmPassword
 * @param {*} callback 
 * @description This function will change the password using old password.
 */
var changePW = function (connectionString, dbName, collectionName, username, oldPassword, newPassword, confirmPassword, salt, callback) {
    try {
        var db = mongo.db(connectionString + dbName, {
            native_parser: false
        });
        db.bind(collectionName);
        var username = username;

        if (confirmPassword !== newPassword) {
            var set = {
                message: "oldPassword & confirmPassword does not match."
            }
            return callback("", set);
        }

        db.collection(collectionName).findOne({
            username: username
        }, function (err, user) {
            if (err) {
                return callback(err, "");
            }

            if (user && bcrypt.compareSync(oldPassword, user.hash)) {
                var hash = bcrypt.hashSync(confirmPassword, salt);
                var data = {
                    hash: hash
                }

                db.collection(collectionName).update({ username: username }, { $set: data }, function (err, user) {
                    if (err) {
                        return callback(err, "");
                    } else {
                        return callback(err, user);
                    }
                })
            } else {
                var set = {
                    message: 'old password is wrong.'
                }
                return callback(err, set);
            }

        })
        db.close();
    } catch (err) {
        throw err;
    }
}

/**
 * @author Akshay Misal
 * @param {*} connectionString 
 * @param {*} dbName 
 * @param {*} collectionName 
 * @param {*} email 
 * @param {*} url 
 * @param {*} callback 
 * @description This function will check email and gives you tinyUrl
 */
var forgotPW = function (connectionString, dbName, collectionName, email, url, callback) {
    try {
        var db = mongo.db(connectionString + dbName, {
            native_parser: false
        });
        db.bind(collectionName);

        db.collection(collectionName).findOne({ email: email }, function (err, user) {
            if (err) {
                return callback(err, "");
            }

            if (user) {
                TinyURL.shorten(url, function (res, err) {
                    var set = {
                        message: "Success",
                        url: res
                    }
                    return callback(err, set)
                });
            } else {
                var set = {
                    message: "email not found."
                }
                return callback(err, set)
            }

        })
        db.close();
    } catch (err) {
        throw err;
    }
}

/**
 * @author Akshay Misal
 * @param {*} connectionString 
 * @param {*} dbName 
 * @param {*} collectionName 
 * @param {*} username 
 * @param {*} confirmPassword 
 * @param {*} callback 
 * @description This function will update the password based on email confirmation.
 */
var updatePW = function (connectionString, dbName, collectionName, username, confirmPassword, salt, callback) {
    try {
        var db = mongo.db(connectionString + dbName, {
            native_parser: false
        });
        db.bind(collectionName);

        var hash = bcrypt.hashSync(confirmPassword, salt);             // add hashed password to user object with salt
        var set = {
            hash: hash
        };

        db.collection(collectionName).update({ username: username }, { $set: set }, function (err, user) {
            if (err) {
                return callback(err, "");
            } else {
                return callback(err, user)
            }

        })
        db.close();
    } catch (err) {
        throw err;
    }
}

module.exports.authenticate = authenticateUser;
module.exports.changePassword = changePW;
module.exports.forgotPassword = forgotPW;
module.exports.updatePassword = updatePW;
