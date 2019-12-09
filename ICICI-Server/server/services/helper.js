/**
 * @author Akshay Misal
 * @description This service will check the variables and gives appropriate results
 */

 var _ = require('lodash')

var service = {};

service.isEmpty = isEmpty;
service.checkStringOrNull = checkStringOrNull;
service.checkIntOrUndefined = checkIntOrUndefined;
service.isLooseTruthy = isLooseTruthy;

module.exports = service;

function isEmpty(value) {
    return _.isUndefined(value) || value === '' || value === null;
}


function checkStringOrNull(value) {
    if (!_.isString(value) || value === '') {
        return null;
    }
    return String(value);
}

function checkIntOrUndefined(value) {
    if (typeof value === 'number') {
        return value;
    }
    if (_.isString(value) && value.match(/^[0-9]+$/g)) {
        return Number(value);
    }
    return undefined;
}

function isLooseTruthy(value) {
    if (value == 'true') {
        return true;
    }
    if (value == 'false') {
        return false;
    }
    return value == true;
}