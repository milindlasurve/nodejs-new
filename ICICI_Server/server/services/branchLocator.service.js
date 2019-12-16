var Q = require('q');
var curdService = require("./crud.service");
var config = require('../config/config.json');

var service = {};

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
    console.log("query obj => ", query)
    var condition;

    if (query.ifsc) {
        condition = {
            "ifsc": query.ifsc
        }
    } else {
        condition = {}
    }

    console.log("condition ", condition);

    curdService.readByCondition("Bank", condition, paramNotReq).then(bankDeatils => {
        if (bankDeatils) {
            deferred.resolve(bankDeatils);
        }
    }).catch(err => {
        deferred.reject(err);
    })
    return deferred.promise;
}