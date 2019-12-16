var nodemailer = require('nodemailer');
var config = require('./../config/config.json');
var helper = require('./helper');

var service = {}

service.sendEmail = sendEmail;

module.exports = service;

function sendEmail(toEmail, toCC, sub, mailBody) {

    if (helper.isEmpty(toEmail)) { throw new Error({ message: "toEmail is empty" }) };

    if (helper.isEmpty(toCC)) { throw new Error({ message: "toCC is empty" }) };

    if (helper.isEmpty(sub)) { throw new Error({ message: "sub is empty" }) };

    if (helper.isEmpty(mailBody)) { throw new Error({ message: "mailBody is empty" }) };

    var smtpTransport = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Office 365 server
        port: 587,     // secure SMTP
        secure: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
        // ignoreTLS: false,
        auth: {
            user: config.mailConfigurationUser,
            pass: config.mailConfigurationPswd,
        }
    });

    console.log("smtpTransport ",smtpTransport)

    var mailOptions = {
        from: config.mailConfigurationUser,
        to: toEmail,
        cc: toCC,
        subject: sub,
        text: mailBody
    }

    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            throw error
        } else {
            return response;
        }
    });
}

// try {
//     var test = sendEmail("sanchita@cateina.com","akshay@cateina.com","yeda","ja be")
//     console.log("test ",test);
// } catch (error) {
//     console.log("erro r",JSON.stringify(error))
// }
