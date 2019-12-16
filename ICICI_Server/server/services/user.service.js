var Q = require('q');
var curdService = require("./crud.service")
var config = require('../config/config.json');
var helper = require('./helper');
var notification = require('./notification.service')
var projectService = require('./project.service');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var rp = require('request-promise');
var TinyURL = require('tinyurl');
var crypto = require('crypto');
var Cryptr = require('cryptr'),
cryptr = new Cryptr('myTotalySecretKey');
var service = {};

service.login = login;
service.userRegistration = userRegistration;
service.changePW = changePW;
service.forgotUpdatePW = forgotUpdatePW;
service.updateUser = updateUser;
service.deleteUser = deleteUser;
service.getUser = getUser;
service.getAllusers = getAllusers;
service.approveUser = approveUser;
service.assignUserGroup = assignUserGroup;
service.createRole = createRole;
service.getAllRoles = getAllRoles;
service.getAllRoutes = getAllRoutes;
service.approveUserByMaker = approveUserByMaker;
service.approveUserByChecker = approveUserByChecker;
service.getUsersFTUC = getUsersFTUC;
service.sendForgotPassMail = sendForgotPassMail
service.registerOrganization = registerOrganization;
module.exports = service;

//=======================COLLECTION NAMES=============================

var collectionName = "Users";
var paramNotReq = {};
var dbName;
var salt = 10;

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
* @author Kuldeep Narvekar
* @param {} body
* @description This function will registers organization.
*/
function registerOrganization(body) {
    var deferred = Q.defer();
    var condition = { organization: body.organization };
    var orgCollection = 'Organizations'
    console.log("org condition: ",condition)
    curdService.insertData(orgCollection, condition, paramNotReq, body).then(data => {
    console.log("registerOrganization res : ",data)
    if (data) {
    deferred.resolve(data);
    }
    }).catch(err => {
    deferred.reject(err);
    })
    return deferred.promise;
    }

/**
 * @author Kuldeep Narvekar
 * @param 
 * @description This function will get user details and send Notification to reset password.
 */
function sendForgotPassMail(body) {
    username = body.username
    var url = body.pageUrl+cryptr.encrypt(username)
    var deferred = Q.defer();
    let condition = {};

    condition = { username: username };
    console.log("url: ",url)
    curdService.readByCondition(collectionName, condition, paramNotReq).then(userData => {
        // console.log("sendForgotPassMail res: ", userData[0].email)
        TinyURL.shorten(url, function (res) {
            let tinyurl = res
            console.log("tinyurl: ", tinyurl)
            var mailBody = "Dear " + userData[0].firstName + ", \n\n Click on the following link to reset the password:\n\n" + tinyurl
            console.log("mailBody: ", mailBody)
            var to = userData[0].email;
            var cc = "sunil@cateina.com;prashant@cateina.com;";
            var sub = "ICICI API Portal : Reset Password"
            notification.sendEmail(to, cc, sub, mailBody);
            deferred.resolve(userData);
        }).catch(function (err) {
            deferred.reject(err);
        })
    }).catch(function (err) {
        deferred.reject(err);
    })
    return deferred.promise;
}

/**
 * @author Aniket Salvi
 * @param  {username,password} body
 * @param {success/failure} res
 * @description This function will authenticate the user.
 */
function login(body) {
    var deferred = Q.defer();
    var username = body.username;
    var password = body.password;
    var secret = config.secret;
    var condition = { username: username }

    curdService.readByCondition(collectionName, condition, paramNotReq).then(function (user) {
        if (bcrypt.compareSync(password, user[0].hash)) {
            user[0].hash = "";
            var set = {
                message: "Login Successful.",
                token: jwt.sign({ sub: user[0]._id }, secret),
                user: user[0]
            };

            deferred.resolve(set);
        } else {
            deferred.reject({
                message: 'Username or password is incorrect'
            });
        }
    }).catch(function (error) {
        deferred.reject(error)
    })

    return deferred.promise;
}

/**
 * @author Aniket Salvi
 * @param {username,firstName, lastName, password, confirmPassword, mobileNumber, email} body
 * @description This function will first check the user and register user.
 */
function userRegistration(body) {
    var deferred = Q.defer();

    // if (helper.isEmpty(body.username)) { deferred.reject({ message: "username is empty" }) };
    // if (helper.isEmpty(body.firstName)) { deferred.reject({ message: "firstName is empty" }) };
    // if (helper.isEmpty(body.lastName)) { deferred.reject({ message: "lastName is empty" }) };
    // if (helper.isEmpty(body.password)) { deferred.reject({ message: "password is empty" }) };
    // if (helper.isEmpty(body.confirmPassword)) { deferred.reject({ message: "confirmPassword is empty" }) };
    // if (helper.isEmpty(body.mobileNumber)) { deferred.reject({ message: "mobileNumber is empty" }) };
    // if (helper.isEmpty(body.email)) { deferred.reject({ message: "email is empty" }) };

    let password = "admin1234";

    body.hash = bcrypt.hashSync(password, config.passwordSalt);
    body.FTUC = false;
    body.makerApproval = false;
    body.checkerApproval = false;
    body.roles = []
    body.confirmPassword = password;

    // set user object to req.body and omit password, confirmPassword fields.
    var user = _.omit(body, 'password');

    var condition = { username: body.email };

    curdService.insertData(collectionName, condition, paramNotReq, user).then(data => {
        if (data) {
            // Changed on 30-Oct-2019 as per discussion with Prashant and ICICI email Templates.
            // let mailBody = "Thanks for registering. It is under process for approval.";
            let mailBodyBusinessSPOC = "Dear " + body.firstNameBusinessSpoc+ ",\n" + body.organisation + "\n \n" + "Greetings from ICICI Bank! \n \n" +
                "We have received your subscription request for the product "+body.productName+" and service flow "+body.serviceName+". \n \n" +
                "Your registered userID is " + body.businessSpocUsername + "\n \n" +
                "Our team is reviewing the details submitted by you at the time registration. We will revert to you shortly. \n \n \n" +
                "This is an auto generated mail, please do not revert to it.";
            let to = body.emailIdBusinessSpoc;
            let cc = "sanchita@cateina.com";
            // let sub = "Registration";
            let sub = "ICICI API Portal : Subscription request received";

            notification.sendEmail(to, cc, sub,mailBodyBusinessSPOC);
            let mailBodyITSPOC = "Dear " + body.firstNameITSpoc+ ",\n" + body.organisation + "\n \n" + "Greetings from ICICI Bank! \n \n" +
            "We have received your subscription request for the product "+body.productName+" and service flow "+body.serviceName+". \n \n" +
            "Your registered userID is " + body.itSpocUsername + "\n \n" +
            "Our team is reviewing the details submitted by you at the time registration. We will revert to you shortly. \n \n \n" +
            "This is an auto generated mail, please do not revert to it.";
        let toitSpoc = body.emailIdITSpoc;
        let ccIT = "sunil@cateina.com;prashant@cateina.com";
        // let sub = "Registration";
        let subIT = "ICICI API Portal : Subscription request received";

        notification.sendEmail(toitSpoc, ccIT, subIT, mailBodyITSPOC);
            // Changed on 30-Oct-2019 as per discussion with Prashant and ICICI email Templates.
            let mailBodys = "Dear Implementation Team, \n \n" +
                "Client " + body.username + " has subscribed for the product "+body.productName+" and service flow "+body.serviceName+". \n \n" +
                "UserID is " + body.username + " for " + body.organisation + ".\n \n" +
                "Please login to the portal for checking details and trigger notification/email to technology team for IP whitelisting and connectivity testing. \n <login link>\n \n \n" +
                "This is an auto generated mail, please do not revert to it.";
            let tos = "sunil@cateina.com";
            let ccs = "prashant@cateina.com";
            let subs = "ICICI API Portal : " + body.organisation + " Subscription request";

            notification.sendEmail(tos, ccs, subs, mailBodys);

            deferred.resolve(data);
        }
    }).catch(err => {
        deferred.reject(err);
    })
    return deferred.promise;
}

/**
 * @author Aniket Salvi
 * @param {username,oldPassword,newPassword,confirmPassword} body
 * @param 
 * @description This function will first check the user and register user.
 */
function changePW(body) {
    var deferred = Q.defer();

    var username = body.username;
    var oldPassword = body.oldPassword;
    var newPassword = body.newPassword;
    var confirmPassword = body.confirmPassword;
    var condition = { username: username };

    curdService.readByCondition(collectionName, condition, paramNotReq).then(function (user) {
        if (bcrypt.compareSync(oldPassword, user[0].hash)) {

            var hash = bcrypt.hashSync(confirmPassword, salt);
            var data = {
                hash: hash
            }

        } else {
            deferred.reject({ message: "oldPassword is incorrect." })
        }
        curdService.updateData(collectionName, data, condition, paramNotReq).then(function (updatedUser) {
            deferred.resolve(updatedUser);
        }).catch(function (err) {
            deferred.reject(err);
        })

    }).catch(function (error) {
        deferred.reject(error);
    })

    return deferred.promise;
}

/**
 * @author Aniket Salvi
 * @param  {username,newPassword,confirmPassword} body
 * @description This function will first check the user and register user.
 */
function forgotUpdatePW(body) {
    var deferred = Q.defer();

    var username = cryptr.decrypt(body.username);
    var confirmPassword = body.confirmPassword;
    var condition = { username: username }

    var hash = bcrypt.hashSync(confirmPassword, salt);             // add hashed password to user object with salt
    var data = {
        hash: hash
    };

    curdService.updateData(collectionName, data, condition, paramNotReq).then(function (response) {
        deferred.resolve(response)
    }).catch(function (error) {
        deferred.reject(error);
    })

    return deferred.promise;
}

/**
 * @author Aniket Salvi
 * @param  {username,firstName,lastName,mobileNumber,email} body
 * @description This function will update user data and store in DB.
 */
function updateUser(body) {
    var deferred = Q.defer();
    var condition = { username: body.username };

    curdService.updateData(collectionName, body, condition, paramNotReq).then(user => {
        deferred.resolve(user);
    }).catch(function (err) {
        deferred.reject(err);
    })
    return deferred.promise;
}


/**
 * @author Aniket Salvi
 * @param  username
 * @description This function will delete user from DB.
 */
function deleteUser(username) {
    var deferred = Q.defer();
    var condition = { username: username };

    curdService.deleteData(collectionName, condition, paramNotReq).then(user => {
        deferred.resolve(user);
    }).catch(function (err) {
        deferred.reject(err);
    })
    return deferred.promise;
}


/**
 * @author Aniket Salvi
 * @param productId
 * @description This function will get product details.
 */
function getUser(username) {
    var deferred = Q.defer();
    let condition = {};

    condition = { username: username };

    curdService.readByCondition(collectionName, condition, paramNotReq).then(userData => {
        deferred.resolve(userData);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param getAllUsers 
 * @description This function will get all users with filters.
 */
function getAllusers(query) {
    var deferred = Q.defer();
    let condition = {};

    condition = {};


    if (query.makerApproval === "true") {
        condition = { makerApproval: true }
    }

    if (query.makerApproval === "false") {
        condition = { makerApproval: false }
    }

    if (query.checkerApproval === "true") {
        condition = { checkerApproval: true }
    }

    if (query.checkerApproval === "false") {
        condition = { checkerApproval: false }
    }

    if (query.username) {
        condition = { username: query.username }
    }

    console.log("user => ", condition);

    curdService.readByCondition(collectionName, condition, paramNotReq).then(users => {
        deferred.resolve(users);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param username, isActive
 * @description This function will approve user based on username and assign the user group (if user is FTUC.) .
 */
function approveUser(body) {
    var deferred = Q.defer();

    let condition = { username: body.username };
    let set;

    if (body.FTUC) {
        set = {
            isActive: body.isActive,
            roles: body.roles
        }
    } else {
        set = {
            isActive: body.isActive
        }
    }


    curdService.updateData(collectionName, set, condition, paramNotReq).then(userData => {
        deferred.resolve(userData);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param username, isActive
 * @description This function will assign the user group.
 */
function assignUserGroup(body) {
    var deferred = Q.defer();

    let condition = { username: username };
    let set = {
        roles: roles
    }

    curdService.updateData(collectionName, set, condition, paramNotReq).then(userData => {
        deferred.resolve(userData);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param username, isActive
 * @description This function will assign the user group.
 */
function createRole(body) {
    var deferred = Q.defer();

    let condition = { role: body.role };
    collectionName = "Roles"

    let set = {
        role: body.role,
        routes: body.routes
    }

    curdService.insertData(collectionName, set, condition, paramNotReq).then(userData => {
        deferred.resolve(userData);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}


/**
 * @author Aniket Salvi
 * @param productId
 * @description This function will get all roles.
 */
function getAllRoles() {
    var deferred = Q.defer();
    let condition = {};

    condition = {};
    collectionName = "Roles"

    curdService.readByCondition(collectionName, condition, paramNotReq).then(userData => {
        deferred.resolve(userData);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}

/**
 * @author Aniket Salvi
 * @param productId
 * @description This function will get all routes.
 */
function getAllRoutes() {
    var deferred = Q.defer();
    let condition = {};

    condition = {};
    collectionName = "Routes"

    curdService.readByCondition(collectionName, condition, paramNotReq).then(userData => {
        deferred.resolve(userData);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param 
 * @description This function will approve user by maker role.
 */
function approveUserByMaker(body) {
    var deferred = Q.defer();

    let condition = { username: body.username };
    let set = body;

    TinyURL.shorten("http://localhost:4200/authentication/changePassword", function (res) {
        let tinyurl = res

        curdService.updateData(collectionName, set, condition, paramNotReq).then(userData => {
            let set = {
                username: body.createdBy,
                status: body.status,
                projectId: body.projectId,
                orgName: body.orgName
            }
            projectService.projectSubmission(set)

            if (body.makerApproval === "true") {
                // Changed on 30-Oct-2019 as per discussion with Prashant and ICICI email Templates.
                // var mailBody = "Dear " + userData[0].firstName +
                //     "\n\nUser has approved successfully. \nThis is your username: " + userData[0].username
                //     + " and password: " + userData[0].confirmPassword + "\nLink: " + tinyurl + " \n\nThank You. \n\n";
                var mailBody = "Dear " + userData[0].firstName + ", \n" + userData[0].organisation + "\n \n " +
                    "Greetings from ICICI Bank! \n \n Your subscription to the product "+userData[0].productName+" and service flow "+userData[0].serviceName+" is done successfully. \n \n" +
                    "Your registered userID is " + userData[0].username + "\n \n" +
                    "Please login to the portal and continue with the set-up using below url. \n" + tinyurl + " \n \n" +
                    "Customer code for collection set-up is <profunds cust code>. This is to be used for creating Virtual Account Number for fund transfer by payers. " +
                    "Virtual Account Number will be the beneficiary account number used by remitter for initiating fund transfer from their respective Bank's portal. \n \n" +
                    "Virtual Account Number (VAN) is combination of the above mentioned customer code and unique payer ID generated by you to identify your payers. \n \n" +
                    "VAN = <Profunds cust code> + Payer unique ID \n \n" +
                    "Eg: VAN for Payer 1 = <Profunds cust code>Payer01 (Total length should be allowed by respective Banks of payers for beneficiary registration). \n \n" +
                    "IFSC code to be used is <ICIC0000104>. \n \n" +
                    "Please share these details with your payer for payment. \n \n \n \n" +
                    "This is an auto generated mail, please do not revert to it.";
                var to = userData[0].email;
                var cc = "sunil@cateina.com;prashant@cateina.com;";
                // var sub = "User Registration successfully";
                var sub = "ICICI API Portal : Subscription confirmation";
            } else {
                // mailBody = "Dear " + userData[0].firstName + "\n\nFailed to approved. \n\nThank You. \n\n";
                mailBody = "Dear " + userData[0].firstName + ", \n" + userData[0].organisation + "\n \n " +
                    "Greetings from ICICI Bank! \n \n " +
                    "Thank you for subscribing for the product "+userData[0].productName+" and service flow "+userData[0].serviceName+". \n \n" +
                    "Unfortunately your request has been rejected for userID " + userData[0].username + "\n \n" +
                    "Reason being <rejection reason entered by checker>. \n \n" +
                    "Our team will get in touch with you futher communication. \n \n \n" +
                    "This is an auto generated mail, please do not revert to it.";
                to = userData[0].email;
                cc = "sunil@cateina.com;prashant@cateina.com;";
                sub = "ICICI API Portal : Subscription failed";
            }

            notification.sendEmail(to, cc, sub, mailBody);
            deferred.resolve(userData);

        }).catch(function (err) {
            deferred.reject(err);
        })

    })

    return deferred.promise;
}


/**
 * @author Akshay Misal
 * @param 
 * @description This function will approve user by maker role.
 */
function approveUserByChecker(body) {
    var deferred = Q.defer();

    let condition = { username: body.username };

    let set = body

    curdService.updateData(collectionName, set, condition, paramNotReq).then(userData => {
        let set = {
            username: body.createdBy,
            status: body.status,
            projectId: body.productId,
            orgName: body.orgName
        }
        projectService.projectSubmission(set); //audit trail

        // if (body.isApprovedChecker){

        // } else {

        // }

        createRepoGit(body.repoName);
        deferred.resolve(userData);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}

/**
 * @author Akshay Misal
 * @param 
 * @description This function will create repo.
 */
function createRepoGit(repoName) {
    var deferred = Q.defer();

    let set = {
        name: repoName
    }

    rp({
        method: 'POST',
        uri: 'https://api.github.com/user/repos',
        body: JSON.stringify(set),
        headers: {
            'User-Agent': 'Request-Promise',
            'Content-Type': 'application/json',
            'Authorization': 'token 589c4150144678bda5db2cf827146af3fcfb1e34'
        }
    }).then(function (res) {
        deferred.resolve(res)
    }).catch(function (err) {
        deferred.reject(err)
    })

    return deferred.promise;
}


/**
 * @author Aniket Salvi
 * @param getUsersFTUC 
 * @description This function will get all users with filters FTUC.
 */
function getUsersFTUC(query) {
    var deferred = Q.defer();
    let condition = {};

    condition = {};
    condition[query.FTUC] = false;

    console.log("user => ", condition);

    curdService.readByCondition(collectionName, condition, paramNotReq).then(users => {
        deferred.resolve(users);
    }).catch(function (err) {
        deferred.reject(err);
    })

    return deferred.promise;
}