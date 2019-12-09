
var crud = require('crud-sdk');
var Q = require('q');
var exception = require('../config/exceptions.json');

exports.insertData = function (collectionName, condition, exclude, reqBody) {
    var deferred = Q.defer();
    crud.readByCondition(collectionName, condition, exclude, function (err, data) {
        if (err) {
            deferred.reject(err);
        }
        if (data.length != 0) {
            deferred.reject({ message: "data is already exist" });
        } else {
            //  Create (Store data in MongoDB)
            crud.create(collectionName, reqBody, function (err, insertData) {

                if (err) {
                    deferred.reject(err);
                } else {
                    if (insertData) {
                        deferred.resolve(insertData);
                    } else {
                        deferred.reject(exception.notFound); // required json data
                    }
                }
            });
        }

    });
    return deferred.promise;
};


exports.insertDataWithoutCheck = function (collectionName, condition, exclude, reqBody) {
    var deferred = Q.defer();

    crud.create(collectionName, reqBody, function (err, insertData) {

        if (err) {
            deferred.reject(err);
        } else {
            if (insertData) {
                deferred.resolve(insertData);
            } else {
                deferred.reject(exception.notFound); // required json data
            }
        }
    });
    return deferred.promise;
};


exports.readByCondition = function (collectionName, condition, exclude) {
    var deferred = Q.defer();
    // var paramNotReq = {_id:0};
    crud.readByCondition(collectionName, condition, exclude, function (err, data) {

        if (err) {

            deferred.reject(err);
        } else if (data && data.length) {

            deferred.resolve(data);
        }
        else {

            var err = "Data not found";
            deferred.resolve([]);
        }

    });
    return deferred.promise;
};

exports.updateData = function (collectionName, updateData, condition, exclude) {
    var deferred = Q.defer();
    crud.readByCondition(collectionName, condition, exclude, function (err, data) {

        if (data == undefined) {
            deferred.reject(exception.unavailable);
        }
        if (err) {
            deferred.reject(err);
        }
        if (data && data.length) {

            crud.update(collectionName, updateData, condition, function (err, response) {
                if (err) {

                    deferred.reject(err);
                }
                deferred.resolve(data);
            });
        }
        else {
            deferred.reject(exception.notFound); // required json data
        }
    });
    return deferred.promise;
};

exports.deleteData = function (collectionName, condition, exclude) {
    var deferred = Q.defer();
    crud.readByCondition(collectionName, condition, exclude, function (err, data) {
        if (data == undefined) {
            deferred.reject(exception.unavailable);
        }
        if (err) {
            deferred.reject(err);
        }
        if (data && data.length) {
            crud.delete(collectionName, condition, function (err, result) {
                if (err) {
                    deferred.reject(err);
                }
                else {
                    deferred.resolve(result);
                }
            });
        }
        else {
            deferred.reject(exception.notFound);
        }
    });
    return deferred.promise;
};