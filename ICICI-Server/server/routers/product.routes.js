var express = require('express');
var router = express.Router();
var productService = require('../services/product.service');
const multer = require('multer');
var mkdirp = require('mkdirp');

var storage = multer.diskStorage({

    destination: function (req, file, cb) {
        var dir = "./Images/Products";
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

router.post('/', upload.single('file'), createProduct);
// router.get('/Id', getProduct);
router.put('/', updateProduct);
router.delete('/', deleteProduct);
router.get('/', getAllProducts);


module.exports = router;

/**
 * @author Aniket Salvi
 * @description This function will create new product.
 */
function createProduct(req, res) {
    var query = req.query;
    var filename = req.file.filename;
    console.log("file data ",req.file)
    productService.createProduct(query, filename).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Aniket Salvi
 * @argument:productId
 * @description This function will get product by ID.
 */
function getProduct(req, res) {
    var productId = req.query.productId;

    productService.getProduct(productId).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/** 
 * @author:Aniket Salvi
 * @argument:body
 * @description: This function will Update product
 */
function updateProduct(req, res) {
    var body = req.body;
    productService.updateProduct(body)
        .then(function (data) {
            res.send({ message: "Product updated." });
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


/** 
 * @author:Aniket Salvi
 * @argument:productId
 * @description: This function will delete product
 */
function deleteProduct(req, res) {
    var productId = req.query.productId;

    productService.deleteProduct(productId)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

/** 
 * @author:Aniket Salvi
 * @argument:productId
 * @description: This function will delete product
 */
function getAllProducts(req, res) {
    productService.getAllProducts(req.query)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}