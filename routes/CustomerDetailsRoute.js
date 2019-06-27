const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const customerController = require('../controllers/CustomerController');
const {
    check
} = require('express-validator/check');

const auth = jwt({
    secret: 'MY_SECRET',
    userProperty: 'payload'
})

router.post('/', [
    check('name', 'Name is required').exists().not().isEmpty(),
    check('email', 'Email is required').exists().not().isEmpty(),
    check('email', 'Invalid email').isEmail(),
    check('phoneNo', 'Invalid phone number').exists().not().isEmpty(),
    check('phoneNo', 'Invalid phone number').matches(/^([0-9]).{10}$/, "i"),
    check('dob', 'Invalid dob').exists(),
    check('dob', 'Invalid dob').isBefore(new Date())
], auth, customerController.createCustomer);

router.get('/:customerId', [
    check('customerId','Invalid Id').isMongoId()
],auth, customerController.getCustomerDetails);

router.put('/:operation', [
    check('operation', 'Invalid operation').isIn(['delete','update']),
    check('id', 'Id is required').exists(),
    check('id', 'Invalid id').isMongoId()
], auth, customerController.updateCustomerDetails);

router.get('/all',auth, customerController.getAllCustomers);

module.exports = router;