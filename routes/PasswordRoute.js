const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const passwordController = require('../controllers/PasswordController');

const {check} = require('express-validator/check');

const auth = jwt({
    secret: 'MY_SECRET',
    userProperty: 'payload'
})

//reset password screen
//router.get('/reset/:uniqueId', passwordController.reset);

router.post('/forgot',[
    check('email', "Email is required").exists().not().isEmpty(),
    check('email', "Invalid Email").isEmail()
], passwordController.forgot);

router.post('/reset', [
    check('password', "Password is required").exists().not().isEmpty(),
    check("password", "Password should contain 1 special char,1 upper case letter, 1 number and length"+
    "of password should be eight characters only").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,8}$/, "i").not().contains(' '),
    check('token', "Token is required").exists().not().isEmpty()    
], passwordController.reset);

router.put('/new',[
    check('email', "Email is required").exists().not().isEmpty(),
    check('email', "Invalid Email").isEmail(),
    check('password', "Password is required").exists().not().isEmpty(),
    check("password", "Password should contain 1 special char,1 upper case letter, 1 number and length"+
    "of password should be eight characters only").matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,8}$/, "i").not().contains(' ')
], auth, passwordController.change);

module.exports = router;