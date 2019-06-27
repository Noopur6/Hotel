const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var User = mongoose.model('Customer');

passport.use(new LocalStrategy({
    usernameField: 'email'
    },
    function(username, password, done) {
        Customer.findOne({ email: username }, function (err, customer) {
            if (err) { return done(err); }
            // Return if customer not found in database
            if (!customer) {
                return done(null, false, {
                    status:"E",
                    error: [
                        {
                            msg: 'Customer not found'
                        }
                    ] 
                });
            }
            // Return if password is wrong
            if (!customer.validPassword(password)) {
                return done(null, false, {
                    status:"E",
                    error: [
                        {
                            msg: 'Password is wrong'
                        }
                    ] 
                });
            }
            // If credentials are correct, return the customer object
            return done(null, customer);
        });
    }
));