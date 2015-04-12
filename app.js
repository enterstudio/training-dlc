/*
* training-dlc
* Created by Austin Moothart(amoothart)
* Kinvey 2015
* A reference sample of how to build a custom Data Link Connector (DLC) with Kinvey.
* The DLC is a micro service that sits between Kinvey and your external data source.
* It is a protocol and a data translator to connect your external data sources to your
* mobile apps.
*
* The DLC receives REST API requests in the same format that Kinvey receives them.
* The request is then translated to an external API format (SOAP, other REST, etc).
* Once the response comes back the DLC should both translate the response into JSON
* if it is not already JSON and remove as much data as possible for a high perfomance
* response to the mobile app.
*/

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var db = require('./db/json-server');

var healthCheck = require('./routes/health-check');
var posts = require('./routes/posts');
//var other-collection = require('./routes/other-collection');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//Health check in point for DLC service monitoring
app.use('/', healthCheck);
//A route for a single collection that contains all necessary CRUD operations
app.use('/posts', posts);
//Add additional route(s) for other collections that receive data from this DLC
//TODO: create DLC endpoints for another collection
//app.use('/other-collection', other-collection);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
