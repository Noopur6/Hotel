const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

let customerSchema = new mongoose.Schema({
    name: {
        type:String,
        required:true
    },
    gender:String,
    email:{
        type: String,
        unique: true,
        required: true
    },
    phoneNo:{
        type:String,
        required:true,
        unique:true
    },
    dob:{
        type:Date,
        required:true
    },
    address:{
        type:String,
        required:true,
        unique:true
    },
    city:{
        type:String,
        required:true,
        unique:true
    },
    state:{
        type:String,
        required:true,
        unique:true
    },
    govIdType:{
        type:String,
        required:true,
        unique:true
    },
    govIdNo:{
        type:String,
        required:true,
        unique:true
    },
    govIdProof:{
        type:String,
        data:Buffer
    },
    hash: String,
    salt: String,
    resetToken: {
        type: String
    }
});

//hashing the password before saving to the db
customerSchema.methods.setPassword = function(password){
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
};

//validating password
customerSchema.methods.validPassword = function(password) {
    var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

//generate the jwt token
customerSchema.methods.generateJwt = function() {
    var expiry = new Date();
    expiry.setDate(expiry.getDate() + 7);
  
    return jwt.sign({
      _id: this._id,
      email: this.email,
      name: this.name,
      exp: parseInt(expiry.getTime() / 1000),
    }, "MY_SECRET"); //TODO: save secret to the environment variable before deploying
};

module.exports = mongoose.model('Customer', customerSchema);