const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

let bookingSchema = new mongoose.Schema({
    bookingId:{
        type: Number,
        required: true
    },
    checkInDate: {
        type: Date,
        required: true
    },
    checkOutDate: {
        type: Date,
        required: true
    },
    noOfDays: {
        type: Number,
        required: true
    },
    discount:{
        type:Number,
        required:true
    },
    bookingCharges:Number,
    customer:{
        type:mongoose.Schema.Types.ObjectId, ref:'Customer'
    },
    roomsBooked: {
        type: [{type:mongoose.Schema.Types.ObjectId, ref:'RoomDetails'}],
        required: true
    }
});

module.exports = mongoose.model('Booking', bookingSchema);