/*
* training-dlc
* Created by Austin Moothart(amoothart)
* Kinvey 2016
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
var bodyParser = require('body-parser');
var db = require('./db/json-server');
var moment = require("moment");

var healthCheck = require('./routes/health-check');
var auth = require('./routes/auth');
var customers = require('./routes/customers');
var partner = require('./routes/partner');
//var other-collection = require('./routes/other-collection');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

//Logging to see what comes in with every request to Kinvey
app.use(function(req, res, next) {
  console.log("=== DLC inbound request ===")
  console.log("Time", moment().toString());
  //incoming request info
  console.log("Request", req.hostname, req.method, req.url);
  //configured secret for the DLC from the Kinvey console
  console.log("Shared Secret", req.headers['x-auth-key']);
  //Authorization header from MIC that can be used to authenticate with data sources
  console.log("MIC auth", req.headers['x-kinvey-auth']);
  //Header from the Kinvey SDK that contains the mobile app version
  console.log("Client App Version", req.headers['x-kinvey-client-app-version']);
   //Custom header from the Kinvey SDK that the mobile developer can create
  console.log("Custom Request Properties", req.headers['x-kinvey-custom-request-properties']); //TODO
  console.log("Request Query", req.query);
  console.log("Request Body", req.body);
  next();
});

/*
 * Convert query paramters from Kinvey standards to the custom datasource
 * standards: sort, skip, limit. This is done for all collections as they
 * all follow the same format.
 */
app.use(function (req, res, next) {
    req.parameters = "";
    //TODO: LAB: add support for converting the Kinvey skip parameter
    if (req.query.skip) {
      // The format used by the custom datasource goes here. In this case it is _start
      var skipParameter = req.parameters ? "&_start=" : "?_start=";
      req.parameters += skipParameter + req.query.skip;
    }
    //TODO: LAB: add support for converting the Kinvey limit parameter
    if (req.query.limit) {
      // The format used by the custom datasource goes here. In this case it is _limit
      var limitParameter = req.parameters ? "&_limit=" : "?_limit=";
      req.parameters += limitParameter + req.query.limit;
    }
    //TODO: LAB: add support for converting the Kinvey sort parameter
    if(req.query.sort) {
      sort = JSON.parse(req.query.sort);
      // The format used by the custom datasource goes here. In this case it is _sort
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
//A route for a single collection that contains all necessary CRUD operations
//baas.kinvey.com/appdata/{kid}/{collection} ==> {dlc_url}/{collection}
//baas.kinvey.com/appdata/{kid}/{collection}/{id} ==> {dlc_url}/{collection}/{id}
app.use('/customers', customers);
//TODO: LAB: add partner route support
app.use('/auth', auth);
//Additional route(s) for other Kiney collections can be added as needed:
//app.use('/other-collection', other-collection);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

module.exports = app;
