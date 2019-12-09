var express = require('express');
var router = express.Router();
var flowService = require('../services/flow.service');

const multer = require('multer');
var mkdirp = require('mkdirp');
var storage = multer.diskStorage({

    destination: function (req, file, cb) {
        var dir = req.query.path;
        mkdirp(dir, function (err) {
            if (err) {
                console.error("<><>", err);
            }
            cb(null, dir);
        });
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }

});
var upload = multer({ storage: storage });

router.post('/', upload.single('file'), flowCreation);
router.put('/', upload.single('file'), updateFlow);
router.get('/', getFlow);
router.delete('/', deleteFlow);
router.put('/projectId', addProjectIdInFlow);
router.post('/api', checkAPI);
router.put('/yaml', upload.single('file'), yamlCreation);

module.exports = router;


/**
 * @author Aniket Salvi
 * @argument:flowId
 * @description This function will get flow by ID.
 */
function flowCreation(req, res) {
    var file = req.file;
    var flowId = "FlowId" + Date.now();
    var flowName = req.query.flowName;

    flowService.flowCreation(file, flowId, flowName).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Aniket Salvi
 * @argument:flowId
 * @description This function will get flow by ID.
 */
function getFlow(req, res) {
    var flowId = req.query.flowId;

    flowService.getFlow(flowId).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}


/** 
 * @author:Aniket Salvi
 * @argument:body
 * @description:Update flow
 */
function updateFlow(req, res) {

    var file = req.file;
    var flowId = req.query.flowId;
    var projectId = req.query.projectId;

    flowService.updateFlow(file, flowId, projectId).then(function (data) {
        res.send({ message: "Flow updated." });
    })
        .catch(function (err) {
            console.log("ERR +>", err)
            res.status(400).send(err);
        });
}

/** 
 * @author:Aniket Salvi
 * @argument:flowId
 * @description:delete flow
 */
function deleteFlow(req, res) {
    var flowId = req.query.flowId;

    flowService.deleteFlow(flowId)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}



/** 
 * @author:Aniket Salvi
 * @argument:body
 * @description:Update flow
 */
function addProjectIdInFlow(req, res) {

    var body = req.body;

    flowService.addProjectIdInFlow(body).then(function (data) {
        res.send({ message: "Project ID Updated." });
    })
        .catch(function (err) {
            console.log("ERR +>", err)
            res.status(400).send(err);
        });
}

/** 
 * @author : Akshay Misal
 * @description : This function will check url status
*/
function checkAPI(req,res) {
    var body = req.body;

    flowService.checkAPI(body).then(function (data) {
        res.send({ message: data});
    })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

/** 
 * @author : Akshay Misal
 * @description : This function will check url status
*/
function yamlCreation(req, res) {
    var body = req.body;

    flowService.yamlCreation(body).then(function (data) {
        res.send({ message: data });
    }).catch(function (err) {
        res.status(400).send(err);
    });
}