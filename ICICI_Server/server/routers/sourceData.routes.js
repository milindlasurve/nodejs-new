
var express = require('express');
var router = express.Router();
var sourceDataService = require('../services/sourceData.service');

router.get('/source', getSourceData);
router.post('/source', addSourceData);
router.post('/', addMappingData);
router.get('/', getMappingData);

module.exports = router;

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 * @description This function will get source data.
 */
function getSourceData(req, res) {

    sourceDataService.getSourceData(req.query).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 * @description This function will add source data.
 */
function addSourceData(req, res) {

    sourceDataService.addSourceData(req.body).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 * @description This function will get mapping data.
 */
function addMappingData(req, res) {

    sourceDataService.addMappingData(req.body).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 * @description This function will get mapping data.
 */
function getMappingData(req, res) {

    sourceDataService.getMappingData(req.query).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}