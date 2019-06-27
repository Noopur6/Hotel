const transporter = require('../config/mail_config');

module.exports.sendMail = function(toEmail, ccMail, subjectContent, body) {

    let mailOptions = {
        from: 'notification.automom@gmail.com',
        to: toEmail, // list of participant
        cc: ccMail, //organiser email
        subject: subjectContent, // Subject line
        html: body //, // plaintext body
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log('Email Error: '+error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
}