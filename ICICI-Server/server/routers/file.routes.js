
var express = require('express');
var router = express.Router();
var fileService = require('../services/file.service');
const multer = require('multer');
var mkdirp = require('mkdirp');

var storage = multer.diskStorage({

    destination: function (req, file, cb) {
        console.log("query parms data in upload file",req.query);

        var dir = "./projectFiles";

        if (req.path === "/yaml"){
            dir = "./Templates/YAML"
        }   

        if (req.path === "/esql"){
            dir = "./Templates/ESQL"
        }

        if (req.query.OtherFiles === "OtherFiles"){
            console.log("in other file dir ");
            dir = req.query.directory
        }
        
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

router.post('/', upload.single('file'), readFile);

router.post('/yaml', upload.single('file'), createYAML);
router.post('/esql', upload.single('file'), createESQL);
router.post('/ui/esql', createESQLUI);
router.post('/ui/yaml', createYAMLUI);

router.get('/',getFileData);

router.get('/get',getFile);

module.exports = router;

/**
 * @author Akshay Misal
 * @description This function will create project.
 */
function readFile(req, res) {
    console.log("req in routes ",req.query.OtherFiles === "OtherFiles")
    if (req.query.OtherFiles === "OtherFiles") {
        res.send({message: "Success"})
    }else {
        fileService.readFile(req.file,req.query).then(function (data) {
            res.send(data);
        }).catch(function (error) {
            res.send(error)        
        })
    }

}

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 */
function getFileData(req,res) {
    fileService.getFileData(req.query).then(function (data) {
        res.send(data);
    }).catch(function (error) {
        res.send(error)        
    })
}

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 */
function createYAML(req,res) {
    console.log("in crearion of yaml")
    fileService.createYAML(req.file, req.query).then(function (data) {
        res.send(data);
    }).catch(function (error) {
        res.send(error)        
    })
}

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 */
function createYAMLUI(req,res) {
    fileService.createYAMLUI(req.body).then(function (data) {
        res.send(data);
    }).catch(function (error) {
        res.send(error)        
    })
}
/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 */
function createESQL(req,res) {
    fileService.createESQL(req.file, req.query).then(function (data) {
        res.send(data);
    }).catch(function (error) {
        res.send(error)        
    })
}

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 */
function createESQLUI(req,res) {
    console.log("req body of esql ",req.body);
    fileService.createESQLUI(req.body).then(function (data) {
        res.send(data);
    }).catch(function (error) {
        res.send(error)        
    })
}

/**
 * @author Aniket Salvi
 * @param {*} req 
 * @param {*} res 
 */
function getFile(req,res) {
    fileService.getFile(req.query).then(function (data) {
        res.send(data);
    }).catch(function (error) {
        res.send(error)        
    })
}