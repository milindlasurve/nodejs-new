var Q = require('q');
var curdService = require("./crud.service")
var config = require('../config/config.json');
var helper = require('./helper')
var _ = require('lodash');

var service = {};

service.serviceCreation = serviceCreation;
service.updateService = updateService;
service.getAllService = getAllService;
service.getServiceByProductId = getServiceByProductId;
service.deleteServiceById = deleteServiceById;

module.exports = service;

//=======================COLLECTION NAMES=============================

var collectionName = "Service";
var paramNotReq = {};
var dbName;

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
 * @param {} body
 * @description This function will create service.
 */
function serviceCreation(body, fileName) {
    var deferred = Q.defer();
    var serviceId = "ServiceId" + Date.now();

    body["serviceId"] = serviceId;
    body["fileName"] = fileName;

    if (helper.isEmpty(body.serviceName)) { deferred.reject({ message: "service name /flow name is empty" }) };
    if (helper.isEmpty(body.description)) { deferred.reject({ message: "description is empty" }) };

    var condition = { serviceId: body.serviceId };

    curdService.insertData(collectionName, condition, paramNotReq, body).then(data => {
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
 * @param {} body
 * @description This function will update service.
 */
function updateService(body) {
    var deferred = Q.defer();

    if (helper.isEmpty(body.serviceId)) { deferred.reject({ message: "serviceId is empty" }) };

    var condition = { serviceId: body.serviceId };

    curdService.updateData(collectionName, body, condition, paramNotReq).then(data => {
        deferred.resolve(data);
    }).catch(err => {
        deferred.reject(err);
    })
    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @description This function will get all service details
 */
function getAllService(query) {
    var deferred = Q.defer();
    var condition = {};

    if (query.serviceId) {
        condition = { serviceId: query.serviceId }
    }

    curdService.readByCondition(collectionName, condition, paramNotReq).then(function (services) {
        deferred.resolve(services);
    })
        .catch(function (err) {
            deferred.reject(err);
        })

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @description This function will get service by productId.
 */
function getServiceByProductId(query) {
    var deferred = Q.defer();
    let condition = {};
    console.log("query =>", query)

    if (query.productId) {
        condition["productId"] = query.productId;
    }

    curdService.readByCondition(collectionName, condition, paramNotReq).then(function (services) {
        deferred.resolve(services);
    })
        .catch(function (err) {
            deferred.reject(err);
        })

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @description This function will delete service by serviceId.
 */
function deleteServiceById(query) {
    var deferred = Q.defer();

    if (helper.isEmpty(query.serviceId)) { deferred.reject({ message: "serviceId is empty" }) };

    let condition = {
        serviceId: query.serviceId
    }

    curdService.deleteData(collectionName, condition, paramNotReq).then(function (services) {
        deferred.resolve(services);
    })
        .catch(function (err) {
            deferred.reject(err);
        })

    return deferred.promise;
}
