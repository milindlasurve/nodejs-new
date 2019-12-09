/**
 * @author Aniket Salvi
 * @version 1.0.0
 */
var Q = require('q');
var path = require('path');

var login_sdk = require('login-sdk');
var curdService = require("./crud.service")
var config = require('../config/config.json');
var helper = require('./helper')
var bcrypt = require('bcryptjs');
var _ = require('lodash');
var rp = require('request-promise');

var service = {};

service.flowCreation = flowCreation;
service.getFlow = getFlow;
service.updateFlow = updateFlow;
service.deleteFlow = deleteFlow;
service.addProjectIdInFlow = addProjectIdInFlow;
service.checkAPI = checkAPI;
service.yamlCreation =yamlCreation;

module.exports = service;


//=======================COLLECTION NAMES=============================

var collectionName = "Flow";
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
 * @author Aniket Salvi
 * @param flowId
 * @description This function will create flow details.
 */
function flowCreation(file, flowId, flowName) {
    var deferred = Q.defer();
    console.log("File =>", file)
    console.log("flowName =>", flowName)
    var body = {
        filename: file.filename,
        path: file.path,
        flowId: flowId,
        flowName: flowName
    };

    let condition = { flowId: flowId };

    console.log("body =>", body);
    curdService.insertData(collectionName, condition, paramNotReq, body).then(data => {
        if (data) {
            deferred.resolve(data);
        }
    }).catch(err => {
        console.log(err)
        deferred.reject(err);
    })
    return deferred.promise;
}


/**
 * @author Aniket Salvi
 * @param flowId
 * @description This function will get flow details.
 */
function getFlow(flowId) {
    var deferred = Q.defer();
    let condition = {};

    if (flowId) {
        condition = { flowId: flowId };
    }

    curdService.readByCondition(collectionName, condition, paramNotReq).then(flow => {
        deferred.resolve(flow);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}

/**
 * @author Aniket Salvi
 * @param {filename, flowId, path} body
 * @description This function will update flow data and store in DB.
 */
function updateFlow(file, flowId, projectId) {
    var deferred = Q.defer();

    var body = {
        filename: file.filename,
        path: file.path,
        flowId: flowId
    };

    let condition = { flowId: flowId };
    console.log("body is =>", body)
    curdService.updateData(collectionName, body, condition, paramNotReq).then(flow => {
        deferred.resolve(flow);
    }).catch(function (err) {
        console.log(err)
        deferred.reject(err);
    })
    return deferred.promise;
}


/**
 * @author Aniket Salvi
 * @param  flowId
 * @description This function will delete flow from DB.
 */
function deleteFlow(flowId) {
    var deferred = Q.defer();
    let condition = { flowId: flowId };

    curdService.deleteData(collectionName, condition, paramNotReq).then(flow => {
        deferred.resolve(flow);
    })
    return deferred.promise;
}


/**
 * @author Aniket Salvi
 * @param {flowId, projectId} body
 * @description This function will update project ID in flow.
 */
function addProjectIdInFlow(body) {
    var deferred = Q.defer();
    let condition = { flowId: body.flowId };
    console.log("body is =>", body)

    // Check projectId is empty or not 
    if (body.projectId) {
        var projectIdArr = [];
        projectIdArr = body.projectId;
        console.log("projectIdArr is =>", projectIdArr)
        // Get first data from DB based on flowId and then update ProjectId array...
        curdService.readByCondition(collectionName, condition, paramNotReq).then(async response => {

            var projectId = [];
            projectId = response[0].projectId;
            console.log("projectId is =>", projectId)
            for (var i = 0; i < projectIdArr.length; i++) {
                await new Promise(next => {
                    projectId.push(projectIdArr[i]);
                    next();
                })
            }
            body.projectId = projectId;
            console.log("After body is =>", body)
        }).catch(function (err) {
            deferred.reject(err);
        })
    }

    curdService.updateData(collectionName, body, condition, paramNotReq).then(flow => {
        deferred.resolve(flow);
    }).catch(function (err) {
        console.log(err)
        deferred.reject(err);
    })
    return deferred.promise;
}

/**
 * @author : Akshay Misal
 * @description : This function will check api. 
 */
function checkAPI(body) {
    var deferred = Q.defer();
    console.log("im in check API");

    if (body.method.toLowerCase() === "post") {
        var options = {
            method: body.method,
            uri: body.URL,
            body: body.reqBody,
            json: true // Automatically stringifies the body to JSON
        };
    } else {
        var options = {
            method: body.method,
            uri: body.URL,
            json: true // Automatically stringifies the body to JSON
        };
    }


    rp(options)
        .then(function (parsedBody) {
            deferred.resolve(parsedBody)
        })
        .catch(function (err) {
            deferred.reject(err);
        });

    return deferred.promise;
}


/**
 * @author : Akshay Misal
 * @description : This function will create yaml. 
 */
function yamlCreation(body) {
    var deferred = Q.defer();

    deferred.resolve

    return deferred.promise;
}