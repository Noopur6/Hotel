const Customer = require('../models/Customer');
const { validationResult } = require('express-validator/check');
const path = require('path');
const commonUtils = require('../utility/CommonUtility');
const forgotemailTemplate = require('../email-templates/forget-pass');
const changeemailTemplate = require('../email-templates/change-pass');
const crypto = require('crypto');
const key = crypto.randomBytes(32);

module.exports.reset = (req, res) => {
    const errors=validationResult(req);
    let flag=errors.isEmpty();
    if(!flag){
        return res.send({status:'E', message: 'Validations failed',error: errors.array({ onlyFirstError: true })});
    }
    let token = req.body.token;
    Customer.findOne({'resetToken' : token}, function(err, customer){
        if(err) {
            res.send({
                status:"E",
                error: [
                    {
                        msg: err
                    }
                ]
            });
        }else if(customer == null) {
            return res.send({
                status:"E",
                message:"Invalid token"
            });
        } else {
            let diff = Math.round(Math.abs((new Date(decrypt(token)).getTime() - new Date().getTime())/(24*60*60*1000)));
            if(diff<0 || diff>2){
                return res.send({
                    status:"E",
                    message:"Token expired"
                });
            }
            customer.setPassword(req.body.password);
            customer.resetToken = null;
            Customer.updateOne({resetToken : token}, customer, function(err){
                if(err) {
                    res.send({
                        status:"E",
                        error: [
                            {
                                msg: err
                            }
                        ]
                    });
                } else {
                    res.send({
                        status:"C",
                        message:"Success"
                    });
                    //send mail
                    commonUtils.sendMail(req.body.email, null, 'AutoMoM: Password changed', 
                    changeemailTemplate.bringThatChangePasswordTemplate(req.body.email));
                }
            });
        }
    });
}

module.exports.change = (req, res) => {
    const errors=validationResult(req);
    let flag=errors.isEmpty();
    if(!flag){
        return res.send({status:'E', message: 'Validations failed',error: errors.array({ onlyFirstError: true })});
    }
    Customer.findOne({email : req.body.email}, function(err, customer){
        if(err) {
            res.send({
                status:"E",
                error: [
                    {
                        msg: err
                    }
                ]
            });
        }else if(customer == null) {
            return res.send({
                status:"E",
                message:"User not found"
            });
        } else {
            customer.setPassword(req.body.password);
            Customer.updateOne({email : req.body.email}, customer, function(err){
                if(err) {
                    res.send({
                        status:"E",
                        error: [
                            {
                                msg: err
                            }
                        ]
                    });
                } else {
                    res.send({
                        status:"C",
                        message:"Success"
                    });
                    //send mail
                    commonUtils.sendMail(req.body.email, null, 'AutoMoM: Password changed', 
                    changeemailTemplate.bringThatChangePasswordTemplate(req.body.email));
                }
            });
        }
    });
}

module.exports.forgot = (req, res) => {
    const errors=validationResult(req);
    let flag=errors.isEmpty();
    if(!flag){
        return res.send({status:'E', message: 'Validations failed',error: errors.array({ onlyFirstError: true })});
    }

    let encryptedToken = encrypt(new Date().toISOString());
    
    Customer.findOneAndUpdate({email : req.body.email}, {$set:{resetToken:encryptedToken}}, { returnNewDocument: true }, 
        function(err, customer){
        if(err) {
            res.send({
                status:"E",
                error: [
                    {
                        msg: err
                    }
                ]
            });
        }else if(customer == null) {
            return res.send({
                status:"E",
                message:"customer not found"
            });
        } else {
            res.send({
                status:"C",
                message:"Success"
            });

            //preparing url
            let url = 'http://localhost:4200/forgot-password/'+encryptedToken;
            // let url = 'https://auto-mom.github.io/automom/forgot-password/'+encryptedToken;

            //send mail
            commonUtils.sendMail(req.body.email, null, 'Hotel: Reset Password', 
            forgotemailTemplate.bringThatForgotPasswordTemplate(url, req.body.email));
        }
    }); 
}

function encrypt(text) {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), Buffer.from('3c1972b10646fdee4525b0bc5eebdadf', 'hex'));
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString('hex');
}

function decrypt(text) {
    let iv = Buffer.from('3c1972b10646fdee4525b0bc5eebdadf', 'hex');
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}