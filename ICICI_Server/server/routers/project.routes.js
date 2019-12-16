
var express = require('express');
var router = express.Router();
var projectService = require('../services/project.service');

router.post('/', projectCreation);
router.put('/', projectSubmission);
router.get('/', getAllProject);
router.delete('/', deleteProjectById);
router.get('/Id', getProjectById);
router.put('/mapping', projectMapping);
// router.put('/submit', projectSubmission);
router.get('/getAuditById', getAuditById);
router.get('/getAudit', getAudit);
router.post('/initiateUAT', initiateUAT);
router.post('/initiateSIT', initiateSIT);

module.exports = router;

/**
 * @author Akshay Misal
 * @description This function will create project.
 */
function projectCreation(req, res) {
    projectService.projectCreation(req.body).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });

}

/**
 * @author Akshay Misal
 * @description This function will update project.
 */
function updateProject(req, res) {
    projectService.updateProject(req.body).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @description This function will get all project details.
 */
function getAllProject(req, res) {
    projectService.getAllProject(req.query).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });

}

/**
 * @author Akshay Misal
 * @description This function will get project detail by id.
 */
function getProjectById(req, res) {
    projectService.getProjectById(req.query).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });

}

/**
 * @author Akshay Misal
 * @description This function will delete project by id.
 */
function deleteProjectById(req, res) {
    projectService.deleteProjectById(req.query).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });

}

/**
 * @author Akshay Misal
 * @description This function will mapped project.
 */
function projectMapping(req, res) {
    projectService.projectMapping(req.body).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @description This function will mapped project.
 */
function projectSubmission(req, res) {
    projectService.projectSubmission(req.body).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @description This function will get audit of the project based on project id.
 */
function getAuditById(req, res) {
    projectService.getAuditById(req.query).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @description This function will get audit of the project.
 */
function getAudit(req,res) {
    projectService.getAudit(req.query).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @description This function will get audit of the project.
 */
function initiateUAT(req,res) {
    console.log("Print Request Body",req.body);
    projectService.initiateUAT(req.body).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @description This function will initaite SIT of the project.
 */
function initiateSIT(req,res) {
    projectService.initiateSIT(req.body).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}