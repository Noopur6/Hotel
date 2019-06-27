const passport = require('passport');
const Customer = require('../models/Customer');
const { validationResult } = require('express-validator/check');

module.exports.register = (req, res) => {
    
    //check validation erros
    let errors = validationResult(req);
    //errors.useFirstErrorOnly().array();
    let flag = errors.isEmpty();
    
    if (!flag) {
        return res.send({status:'E', message: 'Validations failed',error: errors.array({ onlyFirstError: true })});
    }

    let customer = new Customer();
    customer.email = req.body.email;

    customer.setPassword(req.body.password);

    customer.save(function(err) {
        if (err){
            if (err.code == 11000){
                res.send({
                    status:"E",
                    error: [
                        {
                            msg: "customer already exists"
                        }
                    ]
                });
            }
            else{
                res.send({
                    status:"E",
                    error: [
                        {
                            msg: "Some error occured"
                        }
                    ]
                });
            }
        }
        else {
            let token;
            token = customer.generateJwt();
            res.send({
                status:"C",
                message:"Success",
                token: token
            });
        }
    });
}

module.exports.login = (req, res) => {

    //check validation erros
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.send({status:'E', message: 'Validations failed',error: errors.array({ onlyFirstError: true })});
    }

    passport.authenticate('local', function(err, customer, info) {
        let token;

        //if error occured, catch and throw
        if (err) {
            res.status(404).json(err);
        }

        //if user found
        if (customer) {
            token = customer.generateJwt();
            res.status(200);
            res.send({
                status:"C",
                token: token,
                user: {
                    name: customer.name
                }
            })
        }
        else{
            //user not found
            res.status(401).json(info);
        }

    })(req, res);
};