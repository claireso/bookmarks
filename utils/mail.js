var nodemailer = require('nodemailer'),
    config = require('../config');

/*
    CONFIG
*/
// create reusable transport method (opens pool of SMTP connections)
var smtpTransport = nodemailer.createTransport("SMTP", config.mail);

exports.send = function(user, token, host, fn){

    var linkreset = host + '/reset/' + token;

    var mailOptions = {
        from: "Bookmarks ✔ <" + config.mail.auth.user + ">", // sender address
        to: user.email, // list of receivers
        subject: "Bookmarks, reset password ✔", // Subject line
        //text: "Hello world ✔", // plaintext body
        html: 'Change your email <a href="'+linkreset+'">here</a>' // html body
    }

    smtpTransport.sendMail(mailOptions, function(error, response){
        if(error){
            console.log(error);
        } else {
            fn();
        }
        
        smtpTransport.close(); 
    });


}