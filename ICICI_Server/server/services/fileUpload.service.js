var docReader = require("document-reader");
var esqlGenerator = require("esql_generator");
var yamlGenerator = require("yaml_generator_apiconnect");
var shellJs = require("shelljs");
var notification = require('./notification.service')

var Q = require('q');
var curdService = require("./crud.service")
var projectService = require("./project.service");
var service = {}

service.uploadFiles = uploadFiles;

module.exports = service;

var paramNotReq = {};

/**
 * @author Aniket Salvi
 * @param {*} data 
 * @param {*} body 
 * @description This file will read data and returns a JSON Object
 */
async function uploadFiles(file, query) {
    var deferred = Q.defer();
    console.log("query projectId === ", file);
    console.log("Hello");
    console.log("./projectFiles/",query["projectId"],"/" , file.originalname);

    try {
        var jsonObj = await docReader.documentViewer("./projectFiles/"+query["projectId"]+"/" + file.originalname);
        if(jsonObj["_id"]){
            delete jsonObj["_id"];
        }
        console.log("jsonObj ==> ",jsonObj);
        
        var condition;
        if (query.projectId) {
            console.log("in project id ")
            // var condition = { projectId: query.projectId };
            condition = {};
            jsonObj.projectId = query.projectId
            // jsonObj.type = query.type;
        }

        curdService.insertDataWithoutCheck("file", condition, paramNotReq, jsonObj).then(data => {
            console.log(" curdService.insertData =====> ",data)
            if (data) {
                query["status"] = "Ready for Transformation"
                projectService.projectTimeline(query.projectId, query.status, query.username, query.orgName)
                projectService.updateProjectStatus(query)
                deferred.resolve(data);
            }
        }).catch(err => {
            console.error("Error ===> ",err)
            deferred.reject(err);
        })

    } catch (error) {
        deferred.reject(error);
    }

    return deferred.promise;
}


// function uploadFiles(req, res) {
//     var deferred = Q.defer();
//     console.log("multipleImage service uploadProjectImages:", req.body)
//     var data = JSON.parse(req.body.fileInformation)
//     var length = data.length;
//     console.log("image length:",length);
//     for (var i = 0; i < data.length; i++) {
//         console.log("data[i].imageName:",data[i].imageName);
//         var ProjectInformation = {
//             imageName: data[i].imageName,
//             imagePath: data[i].imagePath,
//             type: data[i].type,
//             projectId: data[i].projectId
//         }
//         db.ProjectImage.insert(
//             ProjectInformation,
//             function (err, doc) {
//                 if (err) deferred.reject(err.name + ': ' + err.message);
//                 deferred.resolve(doc);
//             });
//     }
//     return deferred.promise;
// }