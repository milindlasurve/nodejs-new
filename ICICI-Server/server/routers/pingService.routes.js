var express = require('express');
var router = express.Router();
var pingService = require('../services/pingService.service');


router.post('/', pingEndpoint);
router.get('/', getTestFileData);

module.exports = router;


/**
* @author Kuldeep Narvekar
* @description This function registers organization.
*/
function pingEndpoint(req, res) {

    pingService.pingEndpoint(req.body).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });

} 

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 * @description This function will et user details
 */
function getTestFileData(req, res) {

    pingService.getTestFileData(req.query).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}