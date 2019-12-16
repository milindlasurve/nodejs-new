var express = require('express');
var router = express.Router();
var casbinService = require('../services/casbin.service')

router.post('/', createEnforcer);

module.exports = router;

/**
 * @author Aniket Salvi
 * @description This function will create new product.
 */
function createEnforcer(req, res) {
    casbinService.createEnforcer(req.body).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}