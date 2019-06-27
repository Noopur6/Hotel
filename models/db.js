const mongoose = require('mongoose');
var gracefulShutdown;
//var dbURI = 'mongodb://localhost/auto_mom';
var dbURI = 'mongodb://admin:admin123@cluster0-shard-00-00-yytvz.mongodb.net:27017,cluster0-shard-00-01-yytvz.mongodb.net:27017,cluster0-shard-00-02-yytvz.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true';
if (process.env.NODE_ENV === 'production') {
  dbURI = process.env.MONGOLAB_URI;
}
mongoose.set('useCreateIndex', true);
// mongoose.connect('mongodb://admin:admin123@cluster0-shard-00-00-a4m3f.mongodb.net:27017,cluster0-shard-00-01-a4m3f.mongodb.net:27017,cluster0-shard-00-02-a4m3f.mongodb.net:27017/auto_mom?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true', { useNewUrlParser: true });
//mongoose.connect('mongodb://localhost/auto_mom', { useNewUrlParser: true });
mongoose.connect('mongodb://admin:admin123@cluster0-shard-00-00-yytvz.mongodb.net:27017,cluster0-shard-00-01-yytvz.mongodb.net:27017,cluster0-shard-00-02-yytvz.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true', { useNewUrlParser: true });


// CONNECTION EVENTS
mongoose.connection.on('connected', function() {
  console.log('Mongoose connected to ' + dbURI);
});
mongoose.connection.on('error', function(err) {
  console.log('Mongoose connection error: ' + err);
});
mongoose.connection.on('disconnected', function() {
  console.log('Mongoose disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function(msg, callback) {
  mongoose.connection.close(function() {
    console.log('Mongoose disconnected through ' + msg);
    callback();
  });
};
// For nodemon restarts
process.once('SIGUSR2', function() {
  gracefulShutdown('nodemon restart', function() {
    process.kill(process.pid, 'SIGUSR2');
  });
});
// For app termination
process.on('SIGINT', function() {
  gracefulShutdown('app termination', function() {
    process.exit(0);
  });
});
// For Heroku app termination
process.on('SIGTERM', function() {
  gracefulShutdown('Heroku app termination', function() {
    process.exit(0);
  });
});

// BRING IN YOUR SCHEMAS & MODELS
require('./User');
