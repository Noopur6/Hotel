const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const transporter = require('../config/mail_config');

const auth = jwt({
    secret: 'MY_SECRET',
    userProperty: 'payload'
})

router.get('/user', auth ,function(req,res){
    let mailOptions = {
        from: 'notification.automom@gmail.com', // sender address
        to: 'pranjal.nartam@gmail.com', // list of receivers
        cc: 'pranjal.nartam09@gmail.com',
        subject: 'Email Example', // Subject line
        html: "<b>Hello world ✔</b>" //, // plaintext body
    };
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
            res.send({yo: 'error'});
        }else{
            console.log('Message sent: ' + info.response);
            res.send({yo: info.response});
        };
    });
});

module.exports = router;