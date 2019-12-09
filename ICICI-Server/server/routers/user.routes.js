
var express = require('express');
var router = express.Router();
var userService = require('../services/user.service');


router.get('/', getAllUsers);
router.post('/login', login);
router.post('/logout', logout);
router.post('/register', userRegistration);
router.post('/changePassword', changePW);
router.put('/forgetPassword', forgotUpdatePW);
router.put('/updateUser', updateUser);
router.delete('/deleteUser', deleteUser);
router.get('/getAllUsers', getAllUsers);
router.put('/approveUser', approveUser);
router.put('/assignUserGroup', assignUserGroup);
router.post('/createRole', createRole);
router.get('/getAllRoles', getAllRoles);
router.get('/getAllRoutes', getAllRoutes);
router.post('/approveByMaker', approveUserByMaker);
router.post('/approveByChecker', approveUserByChecker);
router.post('/sendForgotPassMail',sendForgotPassMail)
router.post('/registerOrganization',registerOrganization)
module.exports = router;

/**
* @author Kuldeep Narvekar
* @description This function registers organization.
*/
function registerOrganization(req, res) {

    userService.registerOrganization(req.body).then(response => {
    res.send(response);
    }).catch(function (err) {
    res.send(err);
    });
    
    } 
    
/**
 * @author Kuldeep Narvekar
 * @param {*} req 
 * @param {*} res 
 * @description This function will get user details and send Notification to reset password.
 */
function sendForgotPassMail(req, res) {

    userService.sendForgotPassMail(req.body).then(function (response) {
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
function getAllUsers(req, res) {
    console.log("session data in users =",req);
    userService.getAllusers(req.query).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Aniket Salvi
 * @description This function authenticate user.
 */
function login(req, res) {
    userService.login(req.body).then(function (userData) {

        if (userData) {
            req.session.token = userData.token;
            req.session.username = userData.user.username;
            req.session.roles = userData.user.roles;
            res.setHeader("authorization", userData.token);
            console.log("session data ",req.session);
            res.send({
                message: 'Login Successful.', // authentication successful and send token
                response: userData
            });
        } else { // authentication failed
            res.send({
                message: 'Username or password is incorrect'
            });
        }
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Aniket Salvi
 * @description This function will expire user session.
 */
function logout(req, res) {
    req.session.destroy()
    res.send({ message: "Successfully Logout..." })
}


/**
 * @author Aniket Salvi
 * @description This function authenticate user.
 */
function userRegistration(req, res) {

    userService.userRegistration(req.body).then(response => {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });

}

/** 
 * @author:Aniket Salvi
 * @argument:body
 * @description:change password
 */
function changePW(req, res, next) {
    userService.changePW(req.body)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.send(err);
        });
}

/** 
 * @author:Aniket Salvi
 * @argument:body
 * @description:Forgot Password
 */
function forgotUpdatePW(req, res) {
    var body = req.body;
    userService.forgotUpdatePW(body)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


/** 
 * @author:Aniket Salvi
 * @argument:body
 * @description:Update User
 */
function updateUser(req, res) {
    var body = req.body;
    userService.updateUser(body)
        .then(function (data) {
            res.send({ message: "User updated." });
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


/** 
 * @author:Aniket Salvi
 * @argument:username
 * @description:delete User
 */
function deleteUser(req, res) {
    var username = req.query.username;

    userService.deleteUser(username)
        .then(function (data) {
            res.send(data);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 * @description This function will et user details
 */
function getUser(req, res) {
    var username = req.query.username;

    userService.getUser(username).then(function (response) {
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
function approveUser(req, res) {
    userService.approveUser(req.body).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 * @description This function will assign the usergroup to the user.
 */
function assignUserGroup(req, res) {
    userService.assignUserGroup(req.body).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 * @description This function will create user role.
 */
function createRole(req, res) {
    userService.createRole(req.body).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 * @description This function will get all roles.
 */
function getAllRoles(req, res) {
    userService.getAllRoles().then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 * @description This function will get all routes.
 */
function getAllRoutes(req, res) {
    userService.getAllRoutes(req.body).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 * @description This function will approve user by maker role.
 */
function approveUserByMaker(req, res) {
    userService.approveUserByMaker(req.body).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}

/**
 * @author Akshay Misal
 * @param {*} req 
 * @param {*} res 
 * @description This function will approve user by maker role.
 */
function approveUserByChecker(req, res) {
    userService.approveUserByChecker(req.body).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
}


/**
 * @author Aniket Salvi
 * @param {*} req 
 * @param {*} res 
 * @description This function will et user details
 */
function getUsersFTUC(req, res) {

    userService.getUsersFTUC(req.query).then(function (response) {
        res.send(response);
    }).catch(function (err) {
        res.send(err);
    });
} 