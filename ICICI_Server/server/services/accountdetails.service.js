var Q = require('q');
var curdService = require("./crud.service");
var config = require('../config/config.json');

var service = {};

service.getAll = getAll;
service.addIFSCCode = addIFSCCode;
service.getIFSCCodeDetails = getIFSCCodeDetails;

module.exports = service;

//=======================COLLECTION NAMES=============================

var collectionName = ""
var paramNotReq = {};
var dbName;
var salt = 10;

if (config.isDebug) {
    dbName = config.testdb
} else {
    dbName = config.dbName
}

// if (process.env.flag == "test") {
//     dbName = config.testdb
// } 
//==================================================================

/**
 * @author Akshay Misal
 * @param productId
 * @description This function will get all roles.
 */
function getAll(body) {
    var deferred = Q.defer();
    let condition = {};

    condition = { CustomerCode: body.CustomerCode, VAN: body.VAN, IA: body.IA };


    collectionName = "AccountDetails"

    curdService.readByCondition(collectionName, condition, paramNotReq).then(userData => {

        if (userData.length === 0) {
            deferred.reject({ message: "Account details not found." });
        }
        deferred.resolve(userData[0]);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param {*} body 
 */
function addIFSCCode(body) {
    var deferred = Q.defer();

    var condition = {};

    curdService.insertDataWithoutCheck("Bank", condition, paramNotReq, body).then(data => {
        if (data) {
            deferred.resolve(data);
        }
    }).catch(err => {
        deferred.reject(err);
    })
    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param {*} body 
 */
function getIFSCCodeDetails(query) {
    var deferred = Q.defer();
    console.log(query)
    var condition;

    if (query.IFSC) {
        console.log
        condition = { IFSC: query.IFSC }
    } else {
        condition = {}
    }



    curdService.readByCondition("Bank", condition, paramNotReq).then(bankDeatils => {
        if (bankDeatils) {
            deferred.resolve(bankDeatils);
        }
    }).catch(err => {
        deferred.reject(err);
    })
    return deferred.promise;
}