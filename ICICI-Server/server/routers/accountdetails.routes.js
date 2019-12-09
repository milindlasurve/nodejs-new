
var express = require('express');
var router = express.Router();
var accountdetailsService = require('../services/accountdetails.service');


router.get('/', getAll);
router.post('/ifsc',addIFSCCode);
router.get('/ifsc',getIFSCCodeDetails);

module.exports = router;
/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 * @description This function will get user account details
 */
function getAll(req, res) {

    accountdetailsService.getAll(req.query).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 * @description This function will add bank details
 */
function addIFSCCode(req, res) {

    accountdetailsService.addIFSCCode(req.body).then(function (response) {
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

    accountdetailsService.getIFSCCodeDetails(req.query).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}