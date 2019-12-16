var Q = require('q');
var curdService = require("./crud.service")
var config = require('../config/config.json');
var helper = require('./helper')
var _ = require('lodash');
var fs = require("fs");
var shellJs = require("shelljs");

var service = {};

service.projectCreation = projectCreation;
service.updateProject = updateProject;
service.getAllProject = getAllProject;
service.getProjectById = getProjectById;
service.deleteProjectById = deleteProjectById;
service.updateProjectStatus = updateProjectStatus;
service.projectMapping = projectMapping;
service.projectSubmission = projectSubmission;
service.projectTimeline = projectTimeline;
service.getAuditById = getAuditById;
service.getAudit = getAudit;
service.initiateUAT = initiateUAT;
service.initiateSIT = initiateSIT;

module.exports = service;

//=======================COLLECTION NAMES=============================

var collectionName = "Project";
var paramNotReq = {};
var dbName;

if (config.isDebug) {
    dbName = config.testdb
} else {
    dbName = config.dbName
}

var gitRemoteURL = process.env.gitRemoteURL || "http://icici-xpress:Icici%40999@prod-gitea.13.71.81.159.nip.io/"
console.log("git remote url in project file = ", gitRemoteURL);
//==================================================================

/**
 * @author Akshay Misal
 * @param {} body
 * @description This function will create project.
 */
function projectCreation(body) {
    var deferred = Q.defer();

    if (helper.isEmpty(body.productName)) { deferred.reject({ message: "product name is  empty" }) };
    if (helper.isEmpty(body.products[0].services[0].serviceName)) { deferred.reject({ message: "service name is  empty" }) };
    if (helper.isEmpty(body.products[0].productId)) { deferred.reject({ message: "productId is  empty" }) };
    if (helper.isEmpty(body.products[0].services[0].serviceId)) { deferred.reject({ message: "serviceId is empty" }) };

    var shortProductName = "";
    var shortServiceName = "";
    var serviceName = body.products[0].services[0].serviceName.toLowerCase();
    var projectId = "ProjectID" + Date.now();
    body["projectId"] = projectId;
    body["status"] = "Draft";
    body["creationTime"] = Date();
    body["version"] = "1.0";

    if (serviceName === "ecollection intimation"){
        shortProductName = "eColl";
        shortServiceName = "1a";
    } else if (serviceName === "ecollection with remitter validation") {
        shortProductName = "eColl";
        shortServiceName = "2a";
    } else if (serviceName === "ecollection with remitter validation in intermediary account") {
        shortProductName = "eColl";
        shortServiceName = "3a";
    } else if (serviceName === "ecollection with remitter validation at bank and client's end") {
        shortProductName = "eColl";
        shortServiceName = "4a";
    } else if (serviceName === "isurepay-real time cheque and cash collection validation") {
        shortProductName = "iSure";
        shortServiceName = "5a";
    } 
    
    if (serviceName === "ecollection transaction reversal ips") {
        shortProductName = "eColl";
        shortServiceName = shortServiceName + "TxnRev"
    }

    body["projectName"] = body.clientCode + "_" + shortProductName + "_" + shortServiceName

    console.log("why project is creating.",body)

    var condition = { projectName: body.projectName };

    curdService.insertData(collectionName, condition, paramNotReq, body).then(data => {
        if (data) {
            projectTimeline(projectId, body.status, body.username, body.orgName);
            data["projectId"] = projectId;
            data["projectName"] = body.projectName;
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
 * @description This function will update project.
 */
function updateProject(body) {
    var deferred = Q.defer();

    if (helper.isEmpty(body.projectId)) { deferred.reject({ message: "projectId is empty" }) };

    var condition = { projectId: body.projectId };

    curdService.updateData(collectionName, body, condition, paramNotReq).then(data => {
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
 * @description This function will get all project details
 */
function getAllProject(query) {
    var deferred = Q.defer();
    var condition = {};

    if (query.projectId) {
        condition = { projectId: query.projectId }
    }

    curdService.readByCondition(collectionName, condition, paramNotReq).then(function (projects) {
        deferred.resolve(projects);
    })
        .catch(function (err) {
            deferred.reject(err);
        })

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @description This function will get project by projectId.
 */
function getProjectById(query) {
    var deferred = Q.defer();

    if (helper.isEmpty(query.projectId)) { deferred.reject({ message: "projectId is empty" }) };

    let condition = {
        projectId: query.projectId
    }

    curdService.readByCondition(collectionName, condition, paramNotReq).then(function (projects) {
        deferred.resolve(projects);
    })
        .catch(function (err) {
            deferred.reject(err);
        })

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @description This function will delete project by projectId.
 */
function deleteProjectById(query) {
    var deferred = Q.defer();

    if (helper.isEmpty(query.projectId)) { deferred.reject({ message: "projectId is empty" }) };

    let condition = {
        projectId: query.projectId
    }

    curdService.deleteData(collectionName, condition, paramNotReq).then(function (projects) {
        deferred.resolve(projects);
    })
        .catch(function (err) {
            deferred.reject(err);
        })

    return deferred.promise;
}


/**
 * @author Akshay Misal
 * @param {} body
 * @description This function will update project status.
 * ["ReadyForMapping", "Submitted", etc]
 */
function updateProjectStatus(body) {
    var deferred = Q.defer();

    if (helper.isEmpty(body.projectId)) { deferred.reject({ message: "projectId is empty" }) };

    let condition = { projectId: body.projectId };
    let set = {
        status: body.status,
        event: body.event
    }

    curdService.updateData(collectionName, set, condition, paramNotReq).then(data => {
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
 * @description This function will mapped data.
 */
function projectMapping(body) {
    var deferred = Q.defer();

    if (helper.isEmpty(body.projectId)) { deferred.reject({ message: "projectId is empty" }) };

    let condition = { projectId: body.projectId };
    let set = {
        mappingObj: body.mappingObj,
        status: body.status
    }

    curdService.updateData(collectionName, set, condition, paramNotReq).then(data => {
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
 * @description This function will submit project data with mapping.
 */
function projectSubmission(body) {
    var deferred = Q.defer();
    console.log("body project submiss =  ", body, collectionName)

    if (helper.isEmpty(body.projectId)) { deferred.reject({ message: "projectId is empty" }) };
    if (helper.isEmpty(body.status)) { deferred.reject({ message: "status is empty" }) };

    let condition = { projectId: body.projectId };

    if (body["_id"]) {
        delete body["_id"];
    }

    let set = {
        status: body.status
    }

    curdService.updateData(collectionName, body, condition, paramNotReq).then(data => {
        if (data) {
            projectTimeline(body.projectId, body.status, body.username, body.orgName, body.event)
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
 * @description This function will create project timeline.
 */
function projectTimeline(projectId, status, createdBy, orgName, event) {
    var deferred = Q.defer();
    let condition = {};
    let collection = "AuditTrail"

    let body = {
        projectId: projectId,
        status: status,
        event: event,
        createdBy: createdBy,
        orgName: orgName,
        timeStamp: Date()
    }

    curdService.insertDataWithoutCheck(collection, condition, paramNotReq, body).then(data => {
        console.log("data after creating project timeline ", data);
        if (data) {
            deferred.resolve(data);
        }
    }).catch(err => {
        console.log("data after creating project timeline error ", err);
        deferred.reject(err);
    })
    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param {} 
 * @description This function will create project timeline.
 */
function getAuditById(body) {
    var deferred = Q.defer();
    let condition = { projectId: body.projectId }
    let collection = "AuditTrail"

    curdService.readByCondition(collection, condition, paramNotReq).then(function (project) {
        deferred.resolve(project);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param {} 
 * @description This function will create project timeline.
 */
function getAudit(query) {
    var deferred = Q.defer();
    let condition = {}
    let collection = "AuditTrail";

    if (query.projectId) {
        condition = { projectId: query.projectId }
    }

    if (query.createdBy) {
        condition = { projectId: query.projectId, createdBy: query.createdBy }
    }

    curdService.readByCondition(collection, condition, paramNotReq).then(function (project) {
        deferred.resolve(project);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param {*} reqBody 
 * @description This function will initiate SIT
 */
function initiateUAT(reqBody) {
    var deferred = Q.defer();
    console.log("service name", reqBody.serviceName.toString().toLowerCase())
    console.log("whole request Body in initiateUAT function = ", reqBody);


    let condition = {}
    let collection = "MappinData";
    let noOfFilesToBegenerated = 0;
    if (reqBody.projectId) {
        condition = { projectId: reqBody.projectId }
    }

    curdService.readByCondition(collection, condition, paramNotReq).then(function (testingData) {
        //1. get the template from git 
        var repoPath;
        var fileName;
        var targetFilePath;
        var shellOutput;
        var jenkinsScriptData;
        var yamlRepoName;
        var whichProduct = "eCollection"

        if (reqBody.serviceName.toString().toLowerCase() == "ecollection intimation") {
            yamlRepoName = "eCollection_ClientIntimation_CurrentAccount_IPS_Profunds";
            repoPath = yamlRepoName + "_" + reqBody.clientCode;
            fileName = "test.txt";

            jenkinsScriptData["serviceName"] = yamlRepoName

            var date = new Date()
            var testFileName = reqBody.clientCode + "_NONVALIDATED_" + date.getDate() + date.getMonth() + date.getFullYear() + "_001.txt"
            targetFilePath = "IMPLs/ESQL/" + repoPath + "/Test_Resources/UAT/" + testFileName

            shellJs.exec('chmod 777 ./shell/esql_impl_pull.sh');
            shellOutput = shellJs.exec('./shell/esql_impl_pull.sh ' + gitRemoteURL + " " + repoPath);

        } else if (reqBody.serviceName.toString().toLowerCase() == "ecollection with remitter validation") {
            yamlRepoName = "eCollection_RemitterValidation_CurrentAccount_IPS_Profunds";
            jenkinsScriptData["serviceName"] = yamlRepoName

            repoPath = yamlRepoName + "_" + reqBody.clientCode;
            fileName = "test.txt";

            var date = new Date()
            var testFileName = reqBody.clientCode + "_VERIFY_" + date.getDate() + date.getMonth() + date.getFullYear() + "_001.txt"
            targetFilePath = "IMPLs/ESQL/" + repoPath + "/Test_Resources/UAT/" + testFileName

            shellJs.exec('chmod 777 ./shell/esql_impl_pull.sh');
            shellOutput = shellJs.exec('./shell/esql_impl_pull.sh ' + gitRemoteURL + " " + repoPath);

        } else if (reqBody.serviceName.toString().toLowerCase() == "ecollection with remitter validation in intermediary account") {
            yamlRepoName = "eCollection_RemitterValidation_IntermediateAccount_IPS_Profunds";
            jenkinsScriptData["serviceName"] = yamlRepoName

            repoPath = yamlRepoName + "_" + reqBody.clientCode;
            fileName = "test.txt";

            var date = new Date()
            var testFileName = reqBody.clientCode + "_VERIFY_" + date.getDate() + date.getMonth() + date.getFullYear() + "_001.txt"
            targetFilePath = "IMPLs/ESQL/" + repoPath + "/Test_Resources/UAT/" + testFileName

            shellJs.exec('chmod 777 ./shell/esql_impl_pull.sh');
            shellOutput = shellJs.exec('./shell/esql_impl_pull.sh ' + gitRemoteURL + " " + repoPath);

        } else if (reqBody.serviceName.toString().toLowerCase() == "ecollection with remitter validation at bank and client's end") {
            noOfFilesToBegenerated = 4;
            yamlRepoName = "eCollection_TwoLevel_BankClientValidation_Intermediate_IPS_Profunds"
            repoPath = yamlRepoName + "_" + reqBody.clientCode;

            jenkinsScriptData["serviceName"] = yamlRepoName

            var date = new Date()
            var testFileName = reqBody.clientCode + "_VERIFY_" + date.getDate() + date.getMonth() + date.getFullYear() + "_001.txt"
            targetFilePath = "IMPLs/ESQL/" + repoPath + "/Test_Resources/UAT/" + testFileName

            shellJs.exec('chmod 777 ./shell/esql_impl_pull.sh');
            shellOutput = shellJs.exec('./shell/esql_impl_pull.sh ' + gitRemoteURL + " " + repoPath);

            if (shellOutput) {
                var fileNames = [];
                fileNames.push("eCollection_TwoLevel_BankClientValidation_Intermediate_IPS_Profunds Reversal File.txt")
                fileNames.push("eCollection_TwoLevel_BankClientValidation_Intermediate_IPS_Profunds_ACCEPT.txt")
                fileNames.push("eCollection_TwoLevel_BankClientValidation_Intermediate_IPS_Profunds_MIS.txt")
                fileNames.push("eCollection_TwoLevel_BankClientValidation_Intermediate_IPS_Profunds_Reject.txt")

                readAndGenerateMultipleTestFile(reqBody, repoPath, fileNames).then(function (res) {
                    //shellscrip for pushing file on github 
                    shellJs.exec('chmod 777 ./shell/esql_impl_push.sh');
                    var pushTestFile = shellJs.exec('./shell/esql_impl_push.sh ' + repoPath);
                    deferred.resolve({ message: "successfully pushed file on github." })
                }).catch(function (error) {
                    deferred.reject({ message: "failed to pushed file on github." })
                })
            } else {
                deferred.reject({ message: "shell output is empty " })
            }
        }

        if (shellOutput) {
            readAndGenerateTestFile(reqBody, repoPath, fileName, targetFilePath).then(function (res) {

                //shellscrip for pushing file on github 
                shellJs.exec('chmod 777 ./shell/esql_impl_push.sh');
                var pushTestFile = shellJs.exec('./shell/esql_impl_push.sh ' + repoPath);

                jenkinsScriptData["productName"] = "eCollection"
                jenkinsScriptData["clientCode"] = reqBody.clientCode;
                jenkinsScriptData["IPSClientCode"] = reqBody.IPSClientCode
                jenkinsScriptData["projectId"] = reqBody.projectId;
                jenkinsScriptData["txnReversal"] = reqBody.txnReversal;
                jenkinsScriptData["developmentEnv"] = "UAT"
                jenkinsScriptData["whichProduct"] = "eCollection";

                jenkinScriptPush(jenkinsScriptData).then(function (res) {
                    deferred.resolve({ message: "Jenkins shell output.", res: res })
                }).catch(function (error) {
                    deferred.resolve({ message: "Jenkins shell error.", res: res })
                })

                deferred.resolve({ message: "successfully pushed file on github." })
            }).catch(function (error) {
                deferred.reject({ message: "failed to pushed file on github." })
            })
        } else {
            deferred.reject({ message: "shell output is empty " })
        }

    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param {*} reqBody 
 * @description This function will read and write data from file.
 */
function readAndGenerateTestFile(reqBody, repoPath, fileName, targetFilePath) {
    var deferred = Q.defer();
    console.log("Path Of repoPath ", repoPath);
    console.log("Path Of targetFilePath ", targetFilePath);

    // var path = "IMPLs/ESQL/" + repoPath + "/Test_Resources/UAT/" + fileName;
    //13-12-2019 By khetesh
    targetFilePath = "IMPLs/ESQL/" + repoPath + "/Test_Resources/SIT/test.txt";
    var path = "IMPLs/ESQL/" + repoPath + "/Test_Resources/SIT/test.txt";
    console.log("Path Of IMPL ", path);

    fs.readFile(path, function (err, fileData) {
        console.log("fileData", fileData);
        if (err) { deferred.reject(err) }

        var fileDataArray = [];
        var finalFileData = "";
        var eachLineFileData = fileData.toString().split("\n");

        console.log("eachLineFileData", eachLineFileData);
        for (let i = 0; i < eachLineFileData.length; i++) {

            fileDataArray = eachLineFileData[i].toString().split("|");
            var afterChangingFileData = "";
            var temp = "";
            for (let index = 0; index < fileDataArray.length; index++) {

                temp = fileDataArray[index];
                if (index == 0 || index == 1) {
                    var find = "ABCD"
                    var replace = reqBody.clientCode;
                    temp = fileDataArray[index].toString().replace(find, replace);
                }
                afterChangingFileData += temp + "|";
            }
            finalFileData += afterChangingFileData + "\n"
            console.log("Print Final File data", finalFileData);
        }

        fs.writeFile(targetFilePath, finalFileData, 'utf8', function (err) {
            if (err) { deferred.reject({ message: "failed to write test file.", err: err }) }
            deferred.resolve({ message: "successfully write the test file." })
        })
    });

    return deferred.promise;
}


/**
 * @author Akshay Misal
 * @param {*} reqBody 
 * @description This function will read and write data from file.
 */
function readAndGenerateMultipleTestFile(reqBody, repoPath, fileNames) {
    var deferred = Q.defer();

    var path = "IMPLs/ESQL/" + repoPath + "/Test_Resources/" + fileNames[0]
    var path1 = "IMPLs/ESQL/" + repoPath + "/Test_Resources/" + fileNames[1]
    var path2 = "IMPLs/ESQL/" + repoPath + "/Test_Resources/" + fileNames[2]
    var path3 = "IMPLs/ESQL/" + repoPath + "/Test_Resources/" + fileNames[3]

    fs.readFile(path, function (err, fileData) {
        if (err) { deferred.reject(err) }

        var fileDataArray = [];

        fileDataArray = fileData.toString().split("|");
        var afterChangingFileData = "";
        var temp = "";
        for (let index = 0; index < fileDataArray.length; index++) {
            temp = fileDataArray[index];
            if (index == 0 || index == 1) {
                var find = "ABCD"
                var replace = reqBody.clientCode;
                temp = fileDataArray[index].toString().replace(find, replace);
            }
            afterChangingFileData += temp + "|";
        }

        fs.writeFile(path, afterChangingFileData, 'utf8', function (err) {
            if (err) { deferred.reject({ message: "failed to write 1st test file.", err: err }) }
            fs.writeFile(path1, afterChangingFileData, 'utf8', function (err) {
                if (err) { deferred.reject({ message: "failed to write 2nd test file.", err: err }) }
                fs.writeFile(path2, afterChangingFileData, 'utf8', function (err) {
                    if (err) { deferred.reject({ message: "failed to write 3rd test file.", err: err }) }
                    fs.writeFile(path3, afterChangingFileData, 'utf8', function (err) {
                        if (err) { deferred.reject({ message: "failed to write 4th test file.", err: err }) }
                        deferred.resolve({ message: "successfully write all the test file." })
                    })
                })
            })
        })
    });

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param {*} reqBody 
 * @description This function will initiate SIT
 */
function initiateSIT(reqBody) {
    var deferred = Q.defer();
    console.log("Request body", reqBody.serviceName.toString().toLowerCase());
    let condition = {}
    let collection = "MappinData";
    let noOfFilesToBegenerated = 0;
    if (reqBody.projectId) {
        condition = { projectId: reqBody.projectId }
    }
    console.log("whole request Body in initiateUAT function = ", reqBody);

    curdService.readByCondition(collection, condition, paramNotReq).then(function (testingData) {
        //1. get the template from git 
        var repoPath;
        var fileName;

        if (reqBody.serviceName.toString().toLowerCase() == "ecollection intimation") {
            repoPath = "eCollection_ClientIntimation_CurrentAccount_IPS_Profunds" + "_" + reqBody.clientCode;
            fileName = "sit_test.txt";

            shellJs.exec('chmod 777 ./shell/esql_impl_pull.sh');
            var shellOutput = shellJs.exec('./shell/esql_impl_pull.sh ' + gitRemoteURL + " " + repoPath);

            if (shellOutput) {
                readAndGenerateTestFile(reqBody, repoPath, fileName).then(function (res) {

                    //shellscrip for pushing file on github 
                    shellJs.exec('chmod 777 ./shell/esql_impl_push.sh');
                    var pushTestFile = shellJs.exec('./shell/esql_impl_push.sh ' + repoPath);

                    deferred.resolve({ message: "successfully pushed file on github." })
                }).catch(function (error) {
                    deferred.reject({ message: "failed to pushed file on github." })
                })
            } else {
                deferred.reject({ message: "shell output is empty " })
            }
        } else if (reqBody.serviceName.toString().toLowerCase() == "ecollection with remitter validation") {
            repoPath = "eCollection_RemitterValidation_CurrentAccount_IPS_Profunds" + "_" + reqBody.clientCode;
            fileName = "sit_test.txt";

            shellJs.exec('chmod 777 ./shell/esql_impl_pull.sh');
            var shellOutput = shellJs.exec('./shell/esql_impl_pull.sh ' + gitRemoteURL + " " + repoPath);

            if (shellOutput) {
                readAndGenerateTestFile(reqBody, repoPath, fileName).then(function (res) {

                    //shellscrip for pushing file on github 
                    shellJs.exec('chmod 777 ./shell/esql_impl_push.sh');
                    var pushTestFile = shellJs.exec('./shell/esql_impl_push.sh ' + repoPath);

                    deferred.resolve({ message: "successfully pushed file on github." })
                }).catch(function (error) {
                    deferred.reject({ message: "failed to pushed file on github." })
                })
            } else {
                deferred.reject({ message: "shell output is empty " })
            }
        } else if (reqBody.serviceName.toString().toLowerCase() == "ecollection with remitter validation in intermediary account") {
            repoPath = "eCollection_RemitterValidation_IntermediateAccount_IPS_Profunds" + "_" + reqBody.clientCode;
            fileName = "sit_test.txt";

            shellJs.exec('chmod 777 ./shell/esql_impl_pull.sh');
            var shellOutput = shellJs.exec('./shell/esql_impl_pull.sh ' + gitRemoteURL + " " + repoPath);

            if (shellOutput) {
                readAndGenerateTestFile(reqBody, repoPath, fileName).then(function (res) {

                    //shellscrip for pushing file on github 
                    shellJs.exec('chmod 777 ./shell/esql_impl_push.sh');
                    var pushTestFile = shellJs.exec('./shell/esql_impl_push.sh ' + repoPath);

                    deferred.resolve({ message: "successfully pushed file on github." })
                }).catch(function (error) {
                    deferred.reject({ message: "failed to pushed file on github." })
                })
            } else {
                deferred.reject({ message: "shell output is empty " })
            }
        } else if (reqBody.serviceName.toString().toLowerCase() == "ecollection with remitter validation at bank and client's end") {
            noOfFilesToBegenerated = 4;
            repoPath = "eCollection_TwoLevel_BankClientValidation_Intermediate_IPS_Profunds" + "_" + reqBody.clientCode;

            shellJs.exec('chmod 777 ./shell/esql_impl_pull.sh');
            var shellOutput = shellJs.exec('./shell/esql_impl_pull.sh ' + gitRemoteURL + " " + repoPath);

            if (shellOutput) {
                var fileNames = [];
                fileNames.push("sit_test.txt")

                readAndGenerateTestFile(reqBody, repoPath, fileName).then(function (res) {
                    //shellscrip for pushing file on github 
                    shellJs.exec('chmod 777 ./shell/esql_impl_push.sh');
                    var pushTestFile = shellJs.exec('./shell/esql_impl_push.sh ' + repoPath);
                    deferred.resolve({ message: "successfully pushed file on github." })
                }).catch(function (error) {
                    deferred.reject({ message: "failed to pushed file on github." })
                })
            } else {
                deferred.reject({ message: "shell output is empty " })
            }
        } else {
            deferred.reject({ message: "Please enter correct service name." })
        }
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}


/**
 * @author Akshay Misal
 * @param {*} data 
 * @description This function will push text file to github
 */
function jenkinScriptPush(data) {
    var deferred = Q.defer();
    console.log("jrnkind whole data = ", data);
    productName = data.whichProduct;
    var txnReversal = data.txnReversal.toUpperCase();
    var filePath = "";
    var data = "product_name=" + data.productName + "\nservice_name=" + data.serviceName + "\nprofunds_client_code=" + data.clientCode + "\nips_client_code=" + data.IPSClientCode + "\nprojectId=" + data.projectId + "\ntransaction_reversal=" + txnReversal + "\ndeployment_environment=" + data.developmentEnv;

    //first pull repo
    //shellscrip
    if (productName === "eCollection") {
        console.log("in eCollection jenkin script --> ", gitRemoteURL);
        filePath = "./Templates/Jenkins/eCollection/Jenkins_Input_Data";
        shellJs.exec('chmod 777 ./shell/jenkins_script_pull.sh');
        var jenkinScriptPullOutput = shellJs.exec('./shell/jenkins_script_pull.sh ' + gitRemoteURL);
        console.log("jenkinScriptPullOutput --> ", jenkinScriptPullOutput);
    } else {
        productName = "iSurePay"
        console.log("in else isurePay jenkin script --> ", gitRemoteURL);
        filePath = "./Templates/Jenkins/iSurePay/Jenkins_Input_Data";
        shellJs.exec('chmod 777 ./shell/jenkins_script_yaml_pull.sh');
        var jenkinScriptPullOutput = shellJs.exec('./shell/jenkins_script_yaml_pull.sh ' + gitRemoteURL);
        console.log("jenkinScriptPullOutput --> ", jenkinScriptPullOutput);
    }

    //first read the tect file 
    fs.readFile(filePath, function (error, fileData) {
        if (error) { deferred.reject({ message: "error to read jenkin file", error: error }) }

        fileData = data;

        //modify the text file
        fs.writeFile(filePath, data, 'utf8', function (err) {
            if (err) { deferred.reject({ message: "failed to write file.", err: err }) }

            //shellscrip
            shellJs.exec('chmod 777 ./shell/jenkins_script_push.sh');
            var jenkinScriptPushOutput = shellJs.exec('./shell/jenkins_script_push.sh ' + productName);
            console.log("jenkinScriptPushOutput --> ", jenkinScriptPushOutput);
            deferred.resolve({ message: "success" })
        })
    })

    return deferred.promise;
}