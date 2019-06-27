const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const bookingController = require('../controllers/BookingController');
const {
    check
} = require('express-validator/check');

const auth = jwt({
    secret: 'MY_SECRET',
    userProperty: 'payload'
})

router.post('/', [
    check('checkInDate', 'Invalid Check in date').exists(),
    check('checkOutDate', 'Invalid Check out date').custom(val => new Date(req.body.checkOutDate) > new Date()),
    check('customer', 'Invalid customer').exists(),
    check('noOfRooms', 'Invalid no of rooms').exists(),
    check('roomsBooked', 'Invalid no of rooms').exists(),
    check('discount','Invalid discount').exists(),
    check('bookingCharges', 'Invalid booking charges').exists()
], auth, bookingController.createBooking); 

router.get('/all', auth, bookingController.getAllBookings);

router.put('/:operation', [
    check('operation', 'Invalid operation').isIn(['cancel','update']),
    check('id', 'Id is required').exists(),
    check('id', 'Invalid id').isMongoId()
], auth, bookingController.updateBooking);

router.get('/:bookingId', [
    check('bookingId','Invalid Id').exists()
], auth, bookingController.getBookingDetails);

module.exports = router;