// require('dotenv').config();

var express = require('express');
var path = require('path');
// var favicon = require('serve-favicon');
var logger = require('morgan');
var bodyParser = require('body-parser');

var slack = require('./routes/slack');
var history = require('./routes/history');

var app = express();

const TokenValidator = require('./validators/authorizationToken').TokenValidator;
const tokenValidator = new TokenValidator(process.env.TRANSLATOR_SECRET);

app.set('tokenValidator', tokenValidator);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Ensure short keep-alive to enable server to restart itself for SSL
app.use(function(req, res, next) {
  res.set('Connection', 'Keep-Alive');
  res.set('Keep-Alive', 'timeout=10');
  res.socket.setTimeout(12000);
  return next();
});

app.use('/slack', slack);
app.use(process.env.HISTORY_URL, history);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
