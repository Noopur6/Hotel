const express = require('express');
const router = express.Router();
const jwt = require('express-jwt');
const roomController = require('../controllers/RoomDetailsController');
const {
    check
} = require('express-validator/check');

const auth = jwt({
    secret: 'MY_SECRET',
    userProperty: 'payload'
})

router.post('/', [
    check('roomNo', 'Invalid Room number').exists(),
    check('roomType', 'Invalid Room type').exists(),
    check('bedType', 'Invalid bed type').exists(),
    check('basePrice', 'Invalid base price').exists(),
    check('personCharge', 'Invalid person charge').exists(),
], auth, roomController.createRoom); 

router.get('/all', auth, roomController.getAllRooms);

router.put('/:operation', [
    check('operation', 'Invalid operation').isIn(['cancel','update']),
    check('id', 'Id is required').exists(),
    check('id', 'Invalid id').isMongoId()
], auth, roomController.updateRoomDetails);

router.get('/:roomId', [
    check('roomId','Invalid Id').exists()
], auth, roomController.getRoomDetails);

module.exports = router;