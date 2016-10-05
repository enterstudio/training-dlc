var sdk = require('kinvey-backend-sdk');
var mysql = require('mysql');
var moment = require('moment');

//TODO: LAB: create the KMR service object
  //TODO: LAB: create the KMR dataLink object

  // setInterval(function(){console.log("periodic ping")},60000);

  //TODO: LAB: create the serviceObject to back your Kinvey collection


  // if(err != null) {
  //   console.log(JSON.stringify(err));
  // }

  //TODO: LAB: wire up the REST endpoints that you need to process


  //TODO: LAB: Create a connection to the mysql server

  function show(req, complete) {
    debugInfo(req);
  }

  function list(req, complete) {
    debugInfo(req);
  }

  function count(req, complete) {
    debugInfo(req);
  }

  function create(req, complete) {
    debugInfo(req);
  }

  function formatResponse(row) {
    //TODO: LAB: format the response to match your expected JSON
  }

  function debugInfo(req) {
    console.log("Query: ", req.query);
    console.log("EntityId: ", req.entityId);
    console.log("Body: ", req.body);
    console.log("SeviceObjectName: ", req.serviceObjectName);
    console.log("Method: ", req.method);
    console.log("Headers: ", req.headers);
  }