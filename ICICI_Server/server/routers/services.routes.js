var express = require('express');
var router = express.Router();
var servicesService = require('../services/services.service');
const multer = require('multer');
var mkdirp = require('mkdirp');

var storage = multer.diskStorage({

    destination: function (req, file, cb) {
        var dir = "./Images/Services";
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

router.post('/', upload.single('file'), serviceCreation);
router.put('/', updateService);
router.get('/', getAllService);
router.get('/ProductId', getServiceByProductId);
router.delete('/', deleteServiceById);

module.exports = router;

/**
 * @author Akshay Misal
 * @description This function will create service.
 */
function serviceCreation(req, res) {
    var query = req.query;
    var fileName = req.file.filename;

    servicesService.serviceCreation(query, fileName).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });

}

/**
 * @author Akshay Misal
 * @description This function will update service.
 */
function updateService(req, res) {
    servicesService.updateService(req.body).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @description This function will get all service details.
 */
function getAllService(req, res) {
    servicesService.getAllService(req.query).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });

}

/**
 * @author Akshay Misal
 * @description This function will get service detail by id.
 */
function getServiceByProductId(req, res) {
    servicesService.getServiceByProductId(req.query).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });

}

/**
 * @author Akshay Misal
 * @description This function will delete service by id.
 */
function deleteServiceById(req, res) {
    servicesService.deleteServiceById(req.query).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });

}