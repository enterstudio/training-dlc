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
* if it is not already JSON and remove as much data as possible for a high performance
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
var auth = require('./routes/auth');
var customers = require('./routes/customers');
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

// route middleware that will happen on every request
app.use(function(req, res, next) {
  console.log("=== DLC inbound request ===")
  console.log("Request", req.method, req.url);
  console.log("Shared Secret", req.headers['x-auth-key']);
  console.log("MIC auth", req.headers['x-kinvey-auth']);
  console.log("Client App Version", req.headers['x-kinvey-client-app-version']); //TODO
  console.log("Custom Request Properties", req.headers['x-kinvey-custom-request-properties']); //TODO
  console.log("Request Query", req.query);
  console.log("Request Body", req.body);
  next();
});

// format query parameters correctly for the data source
app.use(function (req, res, next) {
    req.parameters = "";
    if (req.query.skip) {
        var skipParameter = req.parameters ? "&_start=" : "?_start=";
        req.parameters += skipParameter + req.query.skip;
    }
    if (req.query.limit) {
        var limitParameter = req.parameters ? "&_limit=" : "?_limit=";
        req.parameters += limitParameter + req.query.limit;
    }
    if(req.query.sort) {
      sort = JSON.parse(req.query.sort);
      var sortParamter = req.parameters ? "&_sort=" : "?_sort=";
      var sortField = Object.keys(sort)[0];
      req.parameters += sortParamter + sortField;
      var sortDirection = sort[sortField] == 1 ? "ASC" : "DESC";
      req.parameters += "&_order=" + sortDirection;
    }
    next();
});

//Health check in point for DLC service monitoring
app.use('/', healthCheck);
//A route for custom authentication
app.use('/auth', auth);
//A route for a single collection that contains all necessary CRUD operations
//baas.kinvey.com/appdata/{kid}/{collection} ==> {dlc_url}/{collection}
//baas.kinvey.com/appdata/{kid}/{collection}/{id} ==> {dlc_url}/{collection}/{id}
app.use('/customers', customers);
//Additional route(s) for other Kiney collections that receive data from this DLC
//TODO: create DLC endpoints for another Kinvey collection
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
