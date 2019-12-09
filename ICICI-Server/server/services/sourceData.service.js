var Q = require('q');
var curdService = require("./crud.service")
var config = require('../config/config.json');
var helper = require('./helper')
var _ = require('lodash');

var service = {};

service.getSourceData = getSourceData;
service.addSourceData = addSourceData;
service.addMappingData = addMappingData;
service.getMappingData = getMappingData;

module.exports = service;

//=======================COLLECTION NAMES=============================

var collectionName = "Users";
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
 * @param {} 
 * @description This function will get source data.
 */
function getSourceData(query) {
    var deferred = Q.defer();
    let condition = { }

    if (query.templateName) {
        condition = {templateName : query.templateName}
    }

    let collection = "SourceData"

    curdService.readByCondition(collection, condition, paramNotReq).then(function (SourceData) {

        if(SourceData.length === 0 ){
            deferred.resolve({message : "Data not found."});
        }

        deferred.resolve(SourceData);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}

/**
 * @author Aniket Salvi
 * @param {} body
 * @description This function will add source data in the database.
 */
function addSourceData(body) {
    var deferred = Q.defer();

    var condition = { templateName : body.templateName};
    let collection = "SourceData"

    curdService.insertData(collection, condition, paramNotReq, body).then(data => {
        if (data) {
            deferred.resolve(data);
        }
    }).catch(err => {
        deferred.reject(err);
    })
    return deferred.promise;
}

/**
 * @author Aniket Salvi
 * @param {} body
 * @description This function will add mapping data in the database.
 */
function addMappingData(body) {
    var deferred = Q.defer();

    var condition = { projectId : body.projectId};
    let collection = "MappinData"

    curdService.insertData(collection, condition, paramNotReq, body).then(data => {
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
 * @param {} 
 * @description This function will get mapping data.
 */
function getMappingData(query) {
    var deferred = Q.defer();
    let condition = { }

    if (query.projectId) {
        condition = {projectId : query.projectId}
    }

    let collection = "MappinData"

    curdService.readByCondition(collection, condition, paramNotReq).then(function (SourceData) {

        if(SourceData.length === 0 ){
            deferred.resolve({message : "Data not found."});
        }

        deferred.resolve(SourceData);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}