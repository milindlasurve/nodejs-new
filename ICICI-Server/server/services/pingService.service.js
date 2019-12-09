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
var fs = require("fs");
var shellJs = require("shelljs");

var service = {};

service.pingEndpoint = pingEndpoint;
service.getTestFileData = getTestFileData;

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
//==================================================================


var gitRemoteURL = process.env.gitRemoteURL || "http://icici-xpress:Icici%40999@prod-gitea.13.71.81.159.nip.io/"
console.log("git remote url in ping service file = ", gitRemoteURL);

/**
 * 
 * @param {*} params
 * @description This function will read test.txt file from github and send back to UI.  
 */
function getTestFileData(query) {
    var deferred = Q.defer();
    var serviceName = query.serviceName.toLowerCase()
    var repoName;

    if (serviceName === "ecollection intimation") {
        repoName = "eCollection_ClientIntimation_CurrentAccount_IPS_Profunds"
    } else if (serviceName === "ecollection with remitter validation") {
        repoName = "eCollection_RemitterValidation_CurrentAccount_IPS_Profunds"
    } else if (serviceName === "ecollection with remitter validation in intermediary account") {
        repoName = "eCollection_RemitterValidation_IntermediateAccount_IPS_Profunds"
    } else if (serviceName === "ecollection with remitter validation at bank and client's end") {
        repoName = "eCollection_TwoLevel_BankClientValidation_Intermediate_IPS_Profunds"
    } else if (serviceName === "isurepay-real time cheque and cash collection validation") {
        repoName = "iSurePay_RT_ChequeCash_ClientValidation_iCore"
    }

    var repoPath = repoName + "_" + query.clientCode;

    shellJs.exec('chmod 777 ./shell/esql_impl_pull.sh');
    var shellOutput = shellJs.exec('./shell/esql_impl_pull.sh ' + gitRemoteURL + " " + repoPath);
    console.log("shell output if get test file data = ", shellOutput);

    var path = "IMPLs/ESQL/" + repoPath + "/Test_Resources/" + "test.txt"
    fs.readFile(path, function (err, fileData) {
        if (err) { deferred.reject({ message: "Failed to get test file." }) }
        var data = fileData.toString()
        deferred.resolve({ message: "Success", fileData: data })
    })
    return deferred.promise;
}

/**
 * @author : Akshay Misal
 * @description : This function will check api. 
 */
function pingEndpoint(body) {
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