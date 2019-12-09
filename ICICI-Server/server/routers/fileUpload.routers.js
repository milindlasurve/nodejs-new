var express = require("express");
var router = express.Router();
var fileUploadService = require("../services/fileUpload.service");
const multer = require("multer");
var mkdirp = require("mkdirp");

var storage = multer.diskStorage({
  // destination
  destination: function(req, file, cb) {
    var dir = "./projectFiles/" + req.query.projectId + "/";
    mkdirp(dir, function(err) {
      if (err) {
        console.error(err);
      }
      cb(null, dir);
    });
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
    if (file.mimetype.startsWith("image")) {
      cb(null, "img1");
    }
  }
});

var upload = multer({ storage: storage });

router.post("/", upload.array("files"), uploadFiles);

module.exports = router;

/**
 * @author Aniket Salvi
 * @description This function will create project.
 */
function uploadFiles(req, res) {
  console.log("file length ==>> ", req.files);
    for (let i = 0; i < req.files.length; i++) {
      fileUploadService.uploadFiles(req.files[i], req.query).then(function(data) {
        res.send(data);
      })
      .catch(function(error) {
        res.send(error);
      });
    }
}
