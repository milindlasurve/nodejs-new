var docReader = require("document-reader");
var esqlGenerator = require("esql_generator");
var yamlGenerator = require("yaml_generator_apiconnect");
var shellJs = require("shelljs");
var notification = require('./notification.service')
var helper = require('./helper');
var fs = require("fs");
var Q = require('q');
var curdService = require("./crud.service")
var projectService = require("./project.service");
var service = {}

service.readFile = readFile;
service.getFileData = getFileData;
service.createYAML = createYAML;
service.createESQL = createESQL;
service.createESQLUI = createESQLUI;
service.createYAMLUI = createYAMLUI;

service.getFile = getFile;

module.exports = service;

var paramNotReq = {};
var gitRemoteURL = process.env.gitRemoteURL || "http://icici-xpress:Icici%40999@prod-gitea.13.71.81.159.nip.io/"
var gitRemoteURLForCreatingRepo = process.env.gitRemoteURLForCreatingRepo || "http://prod-gitea.13.71.81.159.nip.io/";
var gitRemoteToken = process.env.gitRemoteToken || "ef32b3f5de98e04b77221dc580e9bbebd58ca79b"
console.log("git remote url ", gitRemoteURL);
console.log("git gitRemoteURLForCreatingRepo url ", gitRemoteURLForCreatingRepo);
console.log("git gitRemoteToken url ", gitRemoteToken);

/**
 * @author Akshay Misal
 * @param {*} data 
 * @param {*} body 
 * @description This file will read data and returns a JSON Object
 */
async function readFile(file, query) {
    var deferred = Q.defer();
    console.log("query ", query);
    try {
        var jsonObj;

        if (query.url) {
            console.log("read file using url ", query.url)
            jsonObj = await docReader.documentViewer(query.url);
        } else {
            console.log("read file using file sysytem ", file.originalname)
            jsonObj = await docReader.documentViewer("./projectFiles/" + file.originalname);
        }

        console.log("jsonObj ==> ", jsonObj);
        if (jsonObj["_id"]) {
            delete jsonObj["_id"];
        }
        if (query.projectId) {
            console.log("in project id ")
            var condition = { projectId: query.projectId };
            jsonObj.projectId = query.projectId
            jsonObj.type = query.type;
        }

        curdService.insertData("file", condition, paramNotReq, jsonObj).then(data => {
            if (data) {
                query["status"] = "Ready for Transformation"
                projectService.projectTimeline(query.projectId, query.status, query.username, query.orgName)
                projectService.updateProjectStatus(query)
                deferred.resolve(data);
            }
        }).catch(err => {
            deferred.reject(err);
        })

    } catch (error) {
        deferred.reject(error);
    }

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param {*} data 
 * @description This function will get data from database.
 */
function getFileData(data) {
    var deferred = Q.defer();
    console.log("data = > ", data)
    let condition = {};
    if (data.projectId) {
        condition = { projectId: data.projectId };
    }
    if (data.flowId) {
        condition = { flowId: data.flowId };
    }

    if (data.type) {
        condition = { type: data.type };
    }

    if (data.projectId && data.type) {
        condition = { projectId: data.projectId, type: data.type };
    }

    curdService.readByCondition("file", condition, paramNotReq).then(product => {

        if (product.length === 0) {
            deferred.reject({ message: "Data not found" })
        }

        deferred.resolve(product);
    }).catch(function (err) {
        deferred.reject(err);
    })
    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param {*} query 
 * @description This function will get data from database.
 */
async function createYAML(file, query) {
    var deferred = Q.defer();

    let templatePath = "./Templates/YAML/" + file.originalname;
    let data = query.params;
    let fileName = query.fileName

    try {
        var yaml = await yamlGenerator.generateYaml(templatePath, JSON.parse(data), fileName);
        deferred.resolve({ message: "you are in yaml.", res: yaml })
    } catch (error) {
        deferred.reject(error)
    }

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param {*} query 
 * @description This function will get data from database.
 */
async function createYAMLUI(query) {
    var deferred = Q.defer();

    var data = query.params;
    var no_of_yaml_files = 0;

    var serviceName = query.serviceName.toLowerCase();
    var txnReversal = query.txnReversal.toLowerCase();

    let jenkinsScriptData = {};
    jenkinsScriptData["productName"] = "eCollection"

    jenkinsScriptData["clientCode"] = query.clientCode;
    console.log("in yaml vcreation ", jenkinsScriptData)

    try {
        var whichProduct = "eCollection";
        var yaml;
        var shellResponse;
        var yamlRepoName; //this is a file name --- in esql this is a repo/folder
        var yamlTemplateGitRepo = gitRemoteURL + "ixc-ace-eCollection-template/"
        process.env.gitOrgName = "ixc-ace-eCollection-impl";
        process.env.client_code = query.clientCode;


        console.log("YAML DATA ::: ", JSON.stringify(query.params));
        if (serviceName === "ecollection intimation" && txnReversal === "no") {
            console.log("inside ECollection intimation ")
            no_of_yaml_files = 1;
            yamlRepoName = "eCollection_ClientIntimation_CurrentAccount_IPS_Profunds";

            yamlTemplateGitRepo += yamlRepoName;

            process.env.yamlTemplateGitRepo = yamlTemplateGitRepo;
            process.env.yamlTemplateRepo = "YAML/" + yamlRepoName;
            process.env.remoteRepoOfNewClient = gitRemoteURL + "ixc-ace-eCollection-impl/" + yamlRepoName + "_" + query.clientCode + ".git";

            jenkinsScriptData["serviceName"] = yamlRepoName

            //shellscript for pulling templates
            shellJs.exec('chmod 777 ./shell/yamlTemplate.sh');
            shellResponse = shellJs.exec('./shell/yamlTemplate.sh ' + gitRemoteURL);

            let template = "./Templates/YAML/eCollection/" + yamlRepoName + ".yaml";
            let targetPath = "./YAML/eCollection/" + yamlRepoName + "_" + query.clientCode + ".yaml";

            console.log("templae dir ", template);
            console.log("targetPath dir ", targetPath);

            var yaml = await yamlGenerator.generateYaml(template, data, targetPath);
            console.log("ist scenario yaml cfreation response -->  ", yaml);

        } else if (serviceName === "ecollection with remitter validation" && txnReversal === "no") {
            no_of_yaml_files = 1;
            console.log("in scenario 2 ")

            yamlRepoName = "eCollection_RemitterValidation_CurrentAccount_IPS_Profunds";
            jenkinsScriptData["serviceName"] = yamlRepoName
            yamlTemplateGitRepo += yamlRepoName;

            let template = "./Templates/YAML/eCollection/" + yamlRepoName + ".yaml";
            let targetPath = "./YAML/eCollection/" + yamlRepoName + "_" + query.clientCode + ".yaml";

            process.env.yamlTemplateGitRepo = yamlTemplateGitRepo;
            process.env.yamlTemplateRepo = "YAML/" + yamlRepoName;

            //shellscript
            shellJs.exec('chmod 777 ./shell/yamlTemplate.sh');
            shellResponse = shellJs.exec('./shell/yamlTemplate.sh ' + gitRemoteURL);

            var yaml = await yamlGenerator.generateYaml(template, data, targetPath);
        } else if (serviceName === "ecollection with remitter validation in intermediary account" && txnReversal === "no") {
            no_of_yaml_files = 1;
            console.log("in scenario 3 ")

            yamlRepoName = "eCollection_RemitterValidation_IntermediateAccount_IPS_Profunds";
            jenkinsScriptData["serviceName"] = yamlRepoName
            yamlTemplateGitRepo += yamlRepoName;

            let template = "./Templates/YAML/eCollection/" + yamlRepoName + ".yaml";
            let targetPath = "./YAML/eCollection/" + yamlRepoName + "_" + query.clientCode + ".yaml";

            console.log("YAML REPO NAME ::: ", template);
            process.env.yamlTemplateGitRepo = yamlTemplateGitRepo;
            process.env.yamlTemplateRepo = "YAML/" + yamlRepoName;
            process.env.remoteRepoOfNewClient = gitRemoteURL + "ixc-ace-eCollection-impl/" + yamlRepoName + "_" + query.clientCode + ".git";

            //shellscript
            shellJs.exec('chmod 777 ./shell/yamlTemplate.sh');
            shellResponse = shellJs.exec('./shell/yamlTemplate.sh ' + gitRemoteURL);

            var yaml = await yamlGenerator.generateYaml(template, data, targetPath);
            console.log("yaml file gen in 3rd scenario ", yaml);
        } else if (serviceName === "ecollection with remitter validation at bank and client's end" && txnReversal === "no") {
            console.log("in 4th scenario ")
            no_of_yaml_files = 2;

            //shellscript
            shellJs.exec('chmod 777 ./shell/yamlTemplate.sh');
            shellResponse = shellJs.exec('./shell/yamlTemplate.sh ' + gitRemoteURL);

            if (query.fileName === "eCollection_TwoLevel_BankClientValidation_Intermediate_IPS_Profunds_Confirmation.yaml") {
                let yamlRepoName = "eCollection_TwoLevel_BankClientValidation_Intermediate_IPS_Profunds_Confirmation"
                jenkinsScriptData["serviceName"] = "eCollection_TwoLevel_BankClientValidation_Intermediate_IPS_Profunds"
                let template = "./Templates/YAML/eCollection/" + yamlRepoName + ".yaml";
                let targetPath = "./YAML/eCollection/" + yamlRepoName + "_" + query.clientCode + ".yaml";

                process.env.yamlTemplateGitRepo = yamlTemplateGitRepo;
                process.env.yamlTemplateRepo = "YAML/" + yamlRepoName;

                var yaml = await yamlGenerator.generateYaml(template, data, targetPath);
            }

            if (query.fileName === "eCollection_TwoLevel_BankClientValidation_Intermediate_IPS_Profunds_Validation.yaml") {
                console.log("in validation ")
                let yamlRepoName = "eCollection_TwoLevel_BankClientValidation_Intermediate_IPS_Profunds_Validation"
                jenkinsScriptData["serviceName"] = "eCollection_TwoLevel_BankClientValidation_Intermediate_IPS_Profunds"

                let template = "./Templates/YAML/eCollection/" + yamlRepoName + ".yaml";
                let targetPath = "./YAML/eCollection/" + yamlRepoName + "_" + query.clientCode + ".yaml";

                process.env.yamlTemplateGitRepo = yamlTemplateGitRepo;
                process.env.yamlTemplateRepo = "YAML/" + yamlRepoName;

                var yaml = await yamlGenerator.generateYaml(template, data, targetPath);
            }

        } else if (serviceName === "isurepay-real time cheque and cash collection validation" && txnReversal === "no") {
            no_of_yaml_files = 2;
            whichProduct = "iSurePay"
            jenkinsScriptData["productName"] = "iSurePay"
            //shellscript
            shellJs.exec('chmod 777 ./shell/isurepayYAMLTemplate.sh');
            shellResponse = shellJs.exec('./shell/isurepayYAMLTemplate.sh ' + gitRemoteURL);

            if (query.fileName === "iSurePay_RT_ChequeCash_ClientValidation_iCore_Validation.yaml") {
                let yamlFileName = "iSurePay_RT_ChequeCash_ClientValidation_iCore_Validation"
                jenkinsScriptData["serviceName"] = "iSurePay_RT_ChequeCash_ClientValidation_iCore"
                let template = "./Templates/YAML/iSurePay/" + yamlFileName + ".yaml";
                let targetPath = "./YAML/iSurePay/" + yamlFileName + "_" + query.clientCode + ".yaml";

                process.env.yamlTemplateGitRepo = yamlTemplateGitRepo;
                process.env.yamlTemplateRepo = "YAML/" + yamlFileName;
                console.log("in 1st scenario 1stif isurepay data ", data)

                var yaml = await yamlGenerator.generateYaml(template, data, targetPath);
            }

            if (query.fileName === "iSurePay_RT_ChequeCash_ClientValidation_iCore_Receipt.yaml") {
                console.log("in validation ")
                let yamlFileName = "iSurePay_RT_ChequeCash_ClientValidation_iCore_Receipt"
                jenkinsScriptData["serviceName"] = "iSurePay_RT_ChequeCash_ClientValidation_iCore"

                let template = "./Templates/YAML/iSurePay/" + yamlFileName + ".yaml";
                let targetPath = "./YAML/iSurePay/" + yamlFileName + "_" + query.clientCode + ".yaml";

                process.env.yamlTemplateGitRepo = yamlTemplateGitRepo;
                process.env.yamlTemplateRepo = "YAML/" + yamlFileName;
                console.log("in 1st scenario 2stif isurepay data ", data)

                var yaml = await yamlGenerator.generateYaml(template, data, targetPath);
            }
        }

        if (txnReversal === "yes") {
            //shellscript
            shellJs.exec('chmod 777 ./shell/yamlTemplate.sh');
            shellResponse = shellJs.exec('./shell/yamlTemplate.sh ' + gitRemoteURL);

            //update property file
            if (serviceName === "ecollection with remitter validation at bank and client's end") {
                no_of_yaml_files = 3
            } else {
                no_of_yaml_files = 2
            }

            jenkinsScriptData["serviceName"] = query.serviceName

            transactionReversalYAML(query).then(function (res) {
                console.log("successfully created the yaml file")
            }).catch(function (error) {
                console.log("failed to create the yaml file")
            })
        }

        if (query.fileCount === no_of_yaml_files) {
            setTimeout(() => {

                if (whichProduct === "eCollection") {
                    shellJs.exec('chmod 777 ./shell/yaml_push.sh');
                    var shellOutput = shellJs.exec('./shell/yaml_push.sh');
                } else {
                    shellJs.exec('chmod 777 ./shell/iSurePayYAML_push.sh');
                    var shellOutput = shellJs.exec('./shell/iSurePayYAML_push.sh');
                }

                // create audit trail and update project status
                query["status"] = "Ready for Deployment-SIT"
                projectService.projectTimeline(query.projectId, query.status, query.username, query.orgName)
                projectService.updateProjectStatus(query);
                jenkinsScriptData["projectId"] = query.projectId;
                jenkinsScriptData["whichProduct"] = whichProduct;
                jenkinsScriptData["txnReversal"] = query.txnReversal;
                jenkinsScriptData["IPSClientCode"] = query.IPSClientCode
                jenkinScriptPush(jenkinsScriptData).then(function (res) {
                    deferred.resolve({ message: "Jenkins shell output.", res: res })
                }).catch(function (error) {
                    deferred.resolve({ message: "Jenkins shell error.", res: res })
                })

                let mailBody = "Parameters Submited Successfully.";
                let to = "prashant@cateina.com";
                let cc = "sunil@cateina.com";
                let sub = "YAML Mapping";
                notification.sendEmail(to, cc, sub, mailBody)

                deferred.resolve({ message: "success.", res: shellOutput })
            }, 10000);
        } else {
            deferred.resolve({ message: "success" })
        }
    } catch (error) {
        deferred.reject(error)
    }

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param {*} data 
 * @description This function will get data from database.
 */
async function createESQL(file, query) {
    var deferred = Q.defer();

    let templatePath = "./Templates/ESQL/" + file.originalname;
    let params = query.mappedObj;
    let filename = query.fileName;

    // set env variables for creating repo on git
    process.env.clientName = query.clientName;
    process.env.filename = filename;

    try {
        var esql = await esqlGenerator.generateEsql(templatePath, params, filename);

        shellJs.exec('chmod 777 ./shell/git_push.sh');
        var shellOutput = await shellJs.exec('./shell/git_push.sh');

        console.log("shellOutput = ", shellOutput);

        deferred.resolve({ message: "success.", res: shellOutput })

    } catch (error) {
        deferred.reject(error)
    }

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param {*} data 
 * @description This function will get data from database.
 */
async function createESQLUI(query) {
    var deferred = Q.defer();
    console.log("in create esql functio ")

    // if (query.keys != 18){
    //     return deferred.reject({message:"Keys should be 18."})
    // }

    let params = query.mappedObj;
    let filename = "";
    let no_of_esql_files = 0;
    let serviceName = query.serviceName.toLowerCase();
    var txnReversal = query.txnReversal.toLowerCase()
    console.log("serviceName = ", serviceName)
    let serializationFormat = query.serializationFormat.toUpperCase();
    try {
        var esql;
        var shellResponse;
        var esqlRepoName;
        var esqlTemplateGitRepo = gitRemoteURL + "ixc-ace-eCollection-template/"
        var gitOrgName = "ixc-ace-eCollection-impl";
        // For eCollection
        if (serviceName === "ecollection intimation") {
            console.log("inside ECollection intimation ")
            params.sourceType = "JSON";
            params.targetType = "DFDL";

            no_of_esql_files = 1;
            esqlRepoName = "eCollection_ClientIntimation_CurrentAccount_IPS_Profunds";

            esqlTemplateGitRepo += esqlRepoName;

            //shellscript
            shellJs.exec('chmod 777 ./shell/esqlTemplate.sh');
            shellResponse = shellJs.exec('./shell/esqlTemplate.sh ' + gitRemoteURL + " " + gitRemoteURLForCreatingRepo + " " + gitRemoteToken + " " + esqlTemplateGitRepo + " " + query.clientCode + " " + gitOrgName);

            let template = "./Templates/ESQL/" + esqlRepoName + "_" + query.clientCode + "/com/icici/xpress_connect/ecollection/" + "CreateClientAPIRequest.esql";
            let propertyFilePath = "./Templates/ESQL/" + esqlRepoName + "_" + query.clientCode + "/properties/replaceable.properties"

            //update property file
            updatePropertyFile(propertyFilePath, query.clientCode, query.accountNo, query.IFSCCode, query).then(function (res) {
                console.log("successfully update the property file")
            }).catch(function (error) {
                console.log("failed to update the property file")
            })

            //update esq file
            esql = await esqlGenerator.generateEsql(template, params, template);
            console.log("ist scenario ", esql);

        } else if (serviceName === "ecollection with remitter validation") {
            no_of_esql_files = 2;
            console.log("in scenario 2 ")

            esqlRepoName = "eCollection_RemitterValidation_CurrentAccount_IPS_Profunds";
            esqlTemplateGitRepo += esqlRepoName;
            var template = "./Templates/ESQL/" + esqlRepoName + "_" + query.clientCode + "/com/icici/xpress_connect/ecollection/";
            let propertyFilePath = "./Templates/ESQL/" + esqlRepoName + "_" + query.clientCode + "/properties/replaceable.properties"

            //shellscript
            shellJs.exec('chmod 777 ./shell/esqlTemplate.sh');
            shellResponse = shellJs.exec('./shell/esqlTemplate.sh ' + gitRemoteURL + " " + gitRemoteURLForCreatingRepo + " " + gitRemoteToken + " " + esqlTemplateGitRepo + " " + query.clientCode + " " + gitOrgName);

            //update property file
            if (query.fileCount === 2) {
                console.log("finally push the property file")
                updatePropertyFile(propertyFilePath, query.clientCode, query.accountNo, query.IFSCCode, query).then(function (res) {
                    console.log("successfully update the property file")
                }).catch(function (error) {
                    console.log("failed to update the property file")
                })
            }

            if (query.fileName === "CreateClientAPIRequest.esql") {
                console.log("2nd scen 1nd condition ")
                template += "CreateClientAPIRequest.esql";
                params.sourceType = "JSON";
                params.targetType = "DFDL";

                if (serializationFormat === "REST API - XML") {
                    params.sourceType = "XML";

                }

                esql = await esqlGenerator.generateEsql(template, params, template);
                console.log("2nd scen 1nd condition ouput ::: ", esql);
            }

            if (query.fileName === "CreateRemitterRefundMessage.esql") {
                console.log("2nd scen 2nd condition ")
                template += "CreateRemitterRefundMessage.esql";
                params.sourceType = "DFDL";
                params.targetType = "JSON";

                if (serializationFormat === "REST API - XML") {
                    params.targetType = "XML";
                }

                esql = await esqlGenerator.generateEsqlReject(template, params, template);
                console.log("ESQL gen output for 2nd scenario ::: ", esql);
            }
            console.log("Outside 2nd scenario >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
        } else if (serviceName === "ecollection with remitter validation in intermediary account") {
            console.log("Scenario 3 : ");
            esqlRepoName = "eCollection_RemitterValidation_IntermediateAccount_IPS_Profunds";
            esqlTemplateGitRepo += esqlRepoName

            //shellscript
            shellJs.exec('chmod 777 ./shell/esqlTemplate.sh');
            shellResponse = shellJs.exec('./shell/esqlTemplate.sh ' + gitRemoteURL + " " + gitRemoteURLForCreatingRepo + " " + gitRemoteToken + " " + esqlTemplateGitRepo + " " + query.clientCode + " " + gitOrgName);

            no_of_esql_files = 4;
            var template = "./Templates/ESQL/" + esqlRepoName + "_" + query.clientCode + "/com/icici/xpress_connect/ecollection/";
            let propertyFilePath = "./Templates/ESQL/" + esqlRepoName + "_" + query.clientCode + "/properties/replaceable.properties"

            //update property file
            if (query.fileCount === 4) {
                updatePropertyFile(propertyFilePath, query.clientCode, query.accountNo, query.IFSCCode, query).then(function (res) {
                    console.log("successfully update the property file")
                }).catch(function (error) {
                    console.log("failed to update the property file")
                })
            }


            if (query.fileName === "CreateClientAPIRequest.esql") {
                template += "CreateClientAPIRequest.esql";
                params.sourceType = "JSON";
                params.targetType = "DFDL";
                esql = await esqlGenerator.generateEsql(template, params, template);
                console.log("Scenario 3 :in if 1 esql", esql);
            }

            if (query.fileName === "CheckValidationStatus.esql") {
                template += "CheckValidationStatus.esql";
                params.sourceType = "DFDL";
                params.targetType = "Environment.JSON";
                esql = await esqlGenerator.generateEsqlStatusCheck(template, params, template);
                console.log("Scenario 3 esql res if2  : ", esql);
            }

            if (query.fileName === "CreateRemitterFundTransferMessage.esql") {
                template += "CreateRemitterFundTransferMessage.esql";
                params.sourceType = "DFDL";
                params.targetType = "Environment.JSON";
                esql = await esqlGenerator.generateEsqlReject(template, params, template);
                console.log("Scenario 3 :in if 3 esql", esql);
            }

            if (query.fileName === "CreateRemitterRefundMessage.esql") {
                template += "CreateRemitterRefundMessage.esql";
                params.sourceType = "DFDL";
                params.targetType = "Environment.JSON";
                esql = await esqlGenerator.generateEsqlReject(template, params, template);
                console.log("Scenario 3 esql res if4 : ", esql);
            }
        } else if (serviceName === "ecollection with remitter validation at bank and client's end") {
            no_of_esql_files = 6;
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ", query.fileName)
            esqlRepoName = "eCollection_TwoLevel_BankClientValidation_Intermediate_IPS_Profunds";
            esqlTemplateGitRepo += esqlRepoName

            //shellscript
            shellJs.exec('chmod 777 ./shell/esqlTemplate.sh');
            shellResponse = shellJs.exec('./shell/esqlTemplate.sh ' + gitRemoteURL + " " + gitRemoteURLForCreatingRepo + " " + gitRemoteToken + " " + esqlTemplateGitRepo + " " + query.clientCode + " " + gitOrgName);

            var template = "./Templates/ESQL/" + esqlRepoName + "_" + query.clientCode + "/com/icici/xpress_connect/ecollection/";
            let propertyFilePath = "./Templates/ESQL/" + esqlRepoName + "_" + query.clientCode + "/properties/replaceable.properties"

            //update property file
            if (query.fileCount === 6) {
                updatePropertyFile(propertyFilePath, query.clientCode, query.accountNo, query.IFSCCode, query).then(function (res) {
                    console.log("successfully update the property file")
                }).catch(function (error) {
                    console.log("failed to update the property file")
                })
            }

            if (query.fileName === "CreateClientAPIRequest.esql") {
                template += "CreateClientAPIRequest.esql";
                params.sourceType = "JSON";
                params.targetType = "DFDL";

                esql = await esqlGenerator.generateEsql(template, params, template);
            }

            if (query.fileName === "CheckValidationStatus.esql") {
                template += "CheckValidationStatus.esql";
                params.sourceType = "DFDL";
                params.targetType = "Environment.JSON";

                esql = await esqlGenerator.generateEsqlStatusCheck(template, params, template);
            }

            if (query.fileName === "ConfirmationRequestCreation.esql") {
                template += "ConfirmationRequestCreation.esql";
                params.sourceType = "DFDL";
                params.targetType = "JSON";

                esql = await esqlGenerator.generateEsqlReject(template, params, template);
            }

            if (query.fileName === "ConfirmationStatusCheck.esql") {
                template += "ConfirmationStatusCheck.esql";
                params.sourceType = "DFDL";
                params.targetType = "Environment.JSON";

                esql = await esqlGenerator.generateEsqlStatusCheck(template, params, template);
            }

            if (query.fileName === "CreateFundTransferMessage.esql") {
                template += "CreateFundTransferMessage.esql";
                params.sourceType = "DFDL";
                params.targetType = "Environment.JSON";

                esql = await esqlGenerator.generateEsqlReject(template, params, template);
            }

            if (query.fileName === "CreateRefundMessage.esql") {
                template += "CreateRefundMessage.esql";
                params.sourceType = "DFDL";
                params.targetType = "JSON";

                esql = await esqlGenerator.generateEsqlReject(template, params, template);
            }
        } else if (serviceName === "isurepay-real time cheque and cash collection validation") {
            esqlTemplateGitRepo = gitRemoteURL + "ixc-ace-iSurePay-template/";
            esqlRepoName = "iSurePay_RT_ChequeCash_ClientValidation_iCore";
            esqlTemplateGitRepo += esqlRepoName
            gitOrgName = "ixc-ace-iSurePay-impl";
            //shellscript   
            shellJs.exec('chmod 777 ./shell/esqlTemplate.sh');
            shellResponse = shellJs.exec('./shell/esqlTemplate.sh ' + gitRemoteURL + " " + gitRemoteURLForCreatingRepo + " " + gitRemoteToken + " " + esqlTemplateGitRepo + " " + query.clientCode + " " + gitOrgName);
            console.log("in first if file 2")
            no_of_esql_files = 4;
            var template = "./Templates/ESQL/" + esqlRepoName + "_" + query.clientCode + "/com/icici/xpress_connect/isurepay/";
            let propertyFilePath = "./Templates/ESQL/" + esqlRepoName + "_" + query.clientCode + "/properties/replaceable.properties"
            console.log("in first if file 2", template)
            //update property file
            if (query.fileCount === 4) {
                updatePropertyFile(propertyFilePath, query.clientCode, query.accountNo, query.IFSCCode, query).then(function (res) {
                    console.log("successfully update the property file")
                }).catch(function (error) {
                    console.log("failed to update the property file")
                })
            }

            if (query.fileName === "TransformValidationRequestMessage.esql") {
                template += "TransformValidationRequestMessage.esql";
                params.sourceType = "JSON";
                params.targetType = "XML:REF";
                esql = await esqlGenerator.generateEsqlISurePayRequest(template, params, template);
                console.log("Scenario 5a :in if 1 esql", esql);
            }

            if (query.fileName === "TransformValidationResponseMessage.esql") {
                template += "TransformValidationResponseMessage.esql";
                params.sourceType = "XML:JSON";
                params.targetType = "XML";
                console.log("SEcond PARAM DATA ::: ", params)
                esql = await esqlGenerator.generateEsqlISurePayResponse(template, params, template);
                console.log("Scenario 5a :in if 2 esql", esql);
            }

            if (query.fileName === "TransformReceiptRequestMessage.esql") {
                template += "TransformReceiptRequestMessage.esql";
                params.sourceType = "JSON";
                params.targetType = "XML:REF";
                console.log("Scenario 3 in if 3 : ", params);
                esql = await esqlGenerator.generateEsqlISurePayRequest(template, params, template);
                console.log("Scenario 5a :in if 3 esql", esql);
            }

            if (query.fileName === "TransformReceiptResponseMessage.esql") {
                template += "TransformReceiptResponseMessage.esql";
                params.sourceType = "XML:JSON";
                params.targetType = "XML";
                console.log("Fourth PARAM DATA ::: ", params)
                esql = await esqlGenerator.generateEsqlISurePayResponse(template, params, template);
                console.log("Scenario 5a :in if 4 esql", esql);
            }
        } else if (serviceName === "ecollection transaction reversal ips") {
            if (txnReversal === "yes") {
                console.log("inside transaction reversal ", query)
                transactionReversal(query).then(function (transactionReversalRes) {
                    console.log("successfully create transaction reversal file ", transactionReversalRes)
                }).catch(function (transactionReversalError) {
                    console.log("failed to create transaction reversal file ", transactionReversalError)
                })
            }
        }

        // file send to github
        console.log("condition will check no of files ", query.fileCount, no_of_esql_files)
        if (query.fileCount === no_of_esql_files) {
            console.log("finally push the esql file")
            setTimeout(() => {
                esqlTemplateRepo = "ESQL/" + esqlRepoName
                shellJs.exec('chmod 777 ./shell/esql_push.sh');
                var shellOutput = shellJs.exec('./shell/esql_push.sh ' + esqlTemplateRepo + " " + query.clientCode);

                // create audit trail and update project status
                query["status"] = "Ready for Deployment-SIT"
                projectService.projectTimeline(query.projectId, query.status, query.username, query.orgName)
                projectService.updateProjectStatus(query)

                let mailBody = "Parameters Submited Successfully.";
                let to = "prashant@cateina.com";
                let cc = "sunil@cateina.com";
                let sub = "ESQL Mapping";
                notification.sendEmail(to, cc, sub, mailBody);
                deferred.resolve({ message: "success.", res: shellOutput })

            }, 20000);
        } else {
            deferred.resolve({ message: "success", esqlResponse: esql })
        }

    } catch (error) {
        deferred.reject(error)
    }
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
    var jenkinFiledata = "product_name=" + data.productName + "\nservice_name=" + data.serviceName + "\nprofunds_client_code=" + data.clientCode + "\nips_client_code=" + data.IPSClientCode + "\nprojectId=" + data.projectId + "\ntransaction_reversal=" + txnReversal + "\ndeployment_environment=SIT" ;
    console.log("finally jenkins file data ",jenkinFiledata)
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

        fileData = jenkinFiledata;

        //modify the text file
        fs.writeFile(filePath, jenkinFiledata, 'utf8', function (err) {
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

/**
 * @author Aniket Salvi
 * @param {*} data 
 * @description This function will get data from database.
 */
function getFile(data) {
    var deferred = Q.defer();
    console.log("data = > ", data)
    let condition = {};
    if (data.projectId) {
        condition = { projectId: data.projectId };
    }

    curdService.readByCondition("file", condition, paramNotReq).then(product => {

        if (product.length === 0) {
            deferred.reject({ message: "Data not found" })
        }

        deferred.resolve(product);
    }).catch(function (err) {
        deferred.reject(err);
    })
    return deferred.promise;
}

// var path = "/Users/electrnicsbazaar/Documents/Cateina/ICICI/ICICI_Server/Templates/ESQL/iSurePay_RT_ChequeCash_ClientValidation_iCore_123/properties/replaceable.properties"
// var clientCode = "2218";
// var query = {
//     basePath : "/iSurePay/2218",
//     validationPath : "/validation",
//     confirmationPath : "/confirmation"
// }

// updatePropertyFile(path, clientCode, "12346789", "SBIN0009055N",query);
// var afterChangingFileData = "";
function updatePropertyFile(filePath, clientCode, accountNo, IFSCCode, query) {
    var deferred = Q.defer();
    console.log("all data ", filePath, clientCode, accountNo, IFSCCode)
    var path = "/home/aceuser/build/";
    fs.readFile(filePath, function (err, fileData) {
        if (err) { deferred.reject({ message: "Error to read property file.", error: err }) }

        console.log("file data = ", fileData.toString())

        var find = [
            "<InputFileLocation>=<FileIn>",
            "<OutputFileLocation>=<FileOut>",
            "<ClientAPIRequestDetailsLocation>=<RequestOut>",
            "<BankInputFileName>=ABCD",
            "<FILE_UPLOAD_DIRECTORY>=<DestinationOut>",
            "<STORE_ACK_AND_ARCHIVE_DIRECTORY>=<StoreAndArchiveOut>",
            "<ExceptionFilePath>=<ExceptionPath>",
            "<ACCOUNT_NO>=ABCD",
            "<IFSC_CODE>=ABCD",
            "/*validation*",
            "/*confirmation*",
            "/*receipt*",
            "/*reversal*",
            "ABCDR",
            "ABCDRREV"
        ]

        // var replace = [
        //     "<InputFileLocation>=" + path + clientCode + "/IN",
        //     "<OutputFileLocation>=" + path + clientCode + "/OUT",
        //     "<ClientAPIRequestDetailsLocation>=" + path + clientCode + "/REQUEST",
        //     "<BankInputFileName>=" + clientCode,
        //     "<FILE_UPLOAD_DIRECTORY>=" + path + clientCode + "/OUT",
        //     "<STORE_ACK_AND_ARCHIVE_DIRECTORY>=" + path + clientCode + "/OUT",
        //     "<ExceptionFilePath>=" + path + clientCode + "/OUT/trace.txt",
        //     "<ACCOUNT_NO>=" + accountNo,
        //     "<IFSC_CODE>=" + IFSCCode,
        //     query.basePath + query.validationPath,
        //     query.basePath + query.confirmationPath,
        //     query.basePath + query.receiptPath
        // ]

        var replace = [
            "<InputFileLocation>=" + path + "IN",
            "<OutputFileLocation>=" + path + clientCode + "/OUT",
            "<ClientAPIRequestDetailsLocation>=" + path + clientCode + "/REQUEST",
            "<BankInputFileName>=" + clientCode,
            "<FILE_UPLOAD_DIRECTORY>=" + path + clientCode + "/OUT",
            "<STORE_ACK_AND_ARCHIVE_DIRECTORY>=" + path + clientCode + "/OUT",
            "<ExceptionFilePath>=" + path + clientCode + "/OUT/trace.txt",
            "<ACCOUNT_NO>=" + accountNo,
            "<IFSC_CODE>=" + IFSCCode,
            query.basePath + query.validationPath,
            query.basePath + query.confirmationPath,
            query.basePath + query.receiptPath,
            query.basePath + query.reversalPath,
            query.IPSClientCode,
            query.IPSClientCode + "REV"
        ]

        for (let i = 0; i < find.length; i++) {
            fileData = fileData.toString().replace(find[i], replace[i]);
        }

        console.log("fileData array ", fileData)
        fs.writeFile(filePath, fileData, 'utf8', function (error) {
            if (error) { deferred.reject({ message: "Error to update property file", error: error }) }
        })
    })

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param {*} transactionReversalData
 * @description This function will create trnsaction reversal file and will update property file . 
 */
async function transactionReversal(transactionReversalData) {
    var deferred = Q.defer();
    console.log("trsansaction reversal data ", transactionReversalData);
    var esqlRepoName = "eCollection_Transaction_Reversal_IPS";
    var params = transactionReversalData.mappedObjReversal;
    var esqlTemplateGitRepo = gitRemoteURL + "ixc-ace-eCollection-template/"
    var gitOrgName = "ixc-ace-eCollection-impl";

    params.sourceType = "JSON";
    params.targetType = "REVERSAL";
    console.log("params trsansaction reversal data ", params);

    esqlTemplateGitRepo += esqlRepoName;

    //shellscript
    shellJs.exec('chmod 777 ./shell/esqlTemplate.sh');
    shellResponse = shellJs.exec('./shell/esqlTemplate.sh ' + gitRemoteURL + " " + gitRemoteURLForCreatingRepo + " " + gitRemoteToken + " " + esqlTemplateGitRepo + " " + transactionReversalData.IPSClientCode + " " + gitOrgName);

    let template = "./Templates/ESQL/" + esqlRepoName + "_" + transactionReversalData.IPSClientCode + "/com/icici/xpress_connect/ecollection/" + "CreateClientAPIRequest.esql";
    let propertyFilePath = "./Templates/ESQL/" + esqlRepoName + "_" + transactionReversalData.IPSClientCode + "/properties/replaceable.properties"

    //update esq file
    esql = await esqlGenerator.generateEsqlReversal(template, params, template);
    console.log("finally update esql reversal file ", esql)

    setTimeout(() => {
        esqlTemplateRepo = "ESQL/" + esqlRepoName
        shellJs.exec('chmod 777 ./shell/esql_push.sh');
        var shellOutput = shellJs.exec('./shell/esql_push.sh ' + esqlTemplateRepo + " " + transactionReversalData.IPSClientCode);
        console.log("shell output of reversal file ", shellOutput);
    }, 10000);

    updatePropertyFile(propertyFilePath, transactionReversalData.IPSClientCode, transactionReversalData.accountNo, transactionReversalData.IFSCCode, transactionReversalData).then(function (res) {
        console.log("successfully update the property file in reversal", res)
        // deferred.resolve(res)
    }).catch(function (error) {
        console.log("failed to update the property file in reversal", error)
        deferred.reject(error)
    })

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param {*} transactionReversalData
 * @description This function will create trnsaction reversal yaml file. 
 */
async function transactionReversalYAML(transactionReversalData) {
    var deferred = Q.defer();
    console.log("trsansaction reversal YAML data ", transactionReversalData);
    var yamlFileName = "eCollection_Transaction_Reversal_IPS";
    var params = transactionReversalData.params;

    let template = "./Templates/YAML/eCollection/" + yamlFileName + ".yaml";
    let targetPath = "./YAML/eCollection/" + yamlFileName + "_" + transactionReversalData.IPSClientCode + ".yaml";

    var yaml = await yamlGenerator.generateYaml(template, params, targetPath);
    console.log("reversal yaml creation response -->  ", yaml);

    return deferred.promise;
}