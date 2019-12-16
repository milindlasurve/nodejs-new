
var express = require('express');
var router = express.Router();
var branchLocatorService = require('../services/branchLocator.service');

router.post('/',addIFSCCode);
router.get('/',getIFSCCodeDetails);

module.exports = router;

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 * @description This function will add bank details
 */
function addIFSCCode(req, res) {

    branchLocatorService.addIFSCCode(req.body).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}


/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 * @description This function will get user account details
 */
function getIFSCCodeDetails(req, res) {

    branchLocatorService.getIFSCCodeDetails(req.query).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}