const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

let roomDetailsSchema = new mongoose.Schema({
    roomNo:{
        type: Number,
        required: true
    },
    roomType: {
        type: String,
        required: true
    },
    bedType: {
        type: String,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    personCharge: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('RoomDetails', roomDetailsSchema);