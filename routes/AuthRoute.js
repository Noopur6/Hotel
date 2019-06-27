const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const authController = require('../controllers/AuthController');
const { check } = require('express-validator/check');

const auth = jwt({
    secret: 'MY_SECRET',
    userProperty: 'payload'
})

router.post('/register', [
        check('email', "Email is required").exists().not().isEmpty(),
        check('name', "Name is required").exists(), 
        check('name', "Name can contain alphabates only").isAlpha(),
        check('password', "Password is required").exists().not().isEmpty(),
        check("password", "Password should contain 1 special char,1 upper case letter, 1 number and length of password should be eight characters only").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,8}$/, "i").not().contains(' '),
        check('email', "Invalid Email").isEmail()
    ] 
    ,authController.register);

router.post('/login',[
        check('email', "Email is required").exists().not().isEmpty(),
        check('email', "Invalid Email").isEmail(),
        check('password', "Password is required").exists().not().isEmpty(),
        check("password", "Password should contain 1 special char,1 upper case letter, 1 number and length of password should be eight characters only").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,8}$/, "i").not().contains(' '),
    ], authController.login);

module.exports = router;