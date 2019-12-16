/**
 * @author Aniket Salvi
 * @version 1.0.0
 */
var Q = require('q');

var login_sdk = require('login-sdk');
var curdService = require("./crud.service")
var config = require('../config/config.json');
var helper = require('./helper')
var bcrypt = require('bcryptjs');
var _ = require('lodash');
var customeLog = require('../services/customeLog');

var service = {};

service.createProduct = createProduct;
service.getProduct = getProduct;
service.updateProduct = updateProduct;
service.deleteProduct = deleteProduct;
service.getAllProducts = getAllProducts;


module.exports = service;

//=======================COLLECTION NAMES=============================

var collectionName = "Product";
var paramNotReq = {};
var dbName;
if (config.isDebug) {
    dbName = config.testdb
} else {
    dbName = config.dbName
}

// if (process.env.flag == "test") {
//     dbName = config.testdb
// } 

//==================================================================


/**
 * @author Aniket Salvi
 * @param {productName, productId, version} body
 * @description This function will first check the product and add new product.
 */
function createProduct(body, fileName) {
    var deferred = Q.defer();

    var productId = "ProductId" + Date.now();
    body["productId"] = productId;
    body["fileName"] = fileName

    if (helper.isEmpty(body.productName)) { deferred.reject({ message: "productName is empty" }) };
    if (helper.isEmpty(body.description)) { deferred.reject({ message: "description is empty" }) };
    if (helper.isEmpty(body.version)) { deferred.reject({ message: "version is empty" }) };

    let condition = { productId: body.productId };

    curdService.insertData(collectionName, condition, paramNotReq, body).then(data => {
        if (data) {
            deferred.resolve(data);
        }
    }).catch(err => {
        deferred.reject(err);
    })
    return deferred.promise;
}


/**
 * @author Aniket Salvi
 * @param productId
 * @description This function will get product details.
 */
function getProduct(productId) {
    var deferred = Q.defer();
    let condition = {};

    if (helper.isEmpty(productId)) { deferred.reject({ message: "productId is empty" }) };

    condition = { productId: productId };

    curdService.readByCondition(collectionName, condition, paramNotReq).then(product => {
        deferred.resolve(product);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}


/**
 * @author Aniket Salvi
 * @param {productName, productId, version} body
 * @description This function will update product data and store in DB.
 */
function updateProduct(body) {
    var deferred = Q.defer();
    let condition = { productId: body.productId };

    curdService.updateData(collectionName, body, condition, paramNotReq).then(product => {
        deferred.resolve(product);
    }).catch(function (err) {
        deferred.reject(err);
    })
    return deferred.promise;
}


/**
 * @author Aniket Salvi
 * @param  productId
 * @description This function will delete product from DB.
 */
function deleteProduct(productId) {
    var deferred = Q.defer();
    let condition = { productId: productId };

    curdService.deleteData(collectionName, condition, paramNotReq).then(product => {
        deferred.resolve(product);
    }).catch(err => {
        deferred.reject(err);
    })

    return deferred.promise;
}


/**
 * @author Akshay Misal
 * @param  
 * @description This function will get all products.
 */
function getAllProducts(query) {
    var deferred = Q.defer();
    var condition = {};

    if (query.productId) {
        condition = { productId: query.productId }
    }

    curdService.readByCondition(collectionName, condition, paramNotReq).then(product => {
        deferred.resolve(product);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}