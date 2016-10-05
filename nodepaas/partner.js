var sdk = require('kinvey-backend-sdk');
var mysql = require('mysql');
var moment = require('moment');
const cronjob = require('./cronjob.js');

//TODO: LAB: create the KMR service object
var service = sdk.service(function(err, service) {
  //TODO: LAB: create the KMR dataLink object
  var dataLink = service.dataLink;   // gets the datalink object from the service

  setInterval(function(){console.log("periodic ping")},60000);
  // setInterval(cronjob.getAndUpdateData, 300000);

  //TODO: LAB: create the serviceObject to back your Kinvey collection
  var partner = dataLink.serviceObject('Partner');

  if(err != null) {
    console.log(JSON.stringify(err));
  }

  //TODO: LAB: wire up the REST endpoints that you need to process
  partner.onGetById(show);
  partner.onGetAll(list);
  partner.onGetCount(count);
  partner.onInsert(create);

  var connection = mysql.createConnection({
    host     : 'training-mysql.cbefmmhfdivt.us-east-1.rds.amazonaws.com',
    user     : 'training',
    password : 'kinveysql',
    database : "training"
  });

  function show(req, complete) {
    debugInfo(req);
    //TODO: LAB: run the query you need to get data from your external source
    connection.query('SELECT * FROM partner WHERE id = ' + req.entityId, function(error, rows) {
      if(error == null) {
        console.log("MySQl Response: " + JSON.stringify(rows));
        rows.forEach(function(row) {
          //TODO: LAB: format the response to match your expected JSON
          row = formatResponse(row);
        })
        //TODO: LAB: return the correct success response
        return complete(rows).ok().next();
      } else {
        console.log(error);
        //TODO: LAB: return the correct error response
        return complete(error).runtimeError().next();
      }
    })
  }

  function list(req, complete) {
    debugInfo(req);
    //TODO: LAB: run the query you need to get data from your external source
    connection.query('SELECT * FROM partner', function(error, rows) {
      if(error == null) {
        console.log("MySQl Response: " + JSON.stringify(rows));
        rows.forEach(function(row) {
          row = formatResponse(row);
        })
        return complete(rows).ok().next();
      } else {
        console.log(error);
        return complete(error).runtimeError().next();
      }
    })
  }

  function count(req, complete) {
    debugInfo(req);
    //TODO: LAB: run the query you need to get data from your external source
    connection.query('SELECT COUNT(*) FROM partner', function(error, result) {
      if(error == null) {
        console.log("MySQl Response: " + JSON.stringify(result));
        var response = {"count": result[0]["COUNT(*)"]};
        return complete(response).ok().next();
      } else {
        console.log(error);
        return complete(error).runtimeError().next();
      }
    })
  }

  function create(req, complete) {
    debugInfo(req);
    //TODO: LAB: run the query you need to get data from your external source
    var query = 'INSERT INTO partner (Name, Email, created_time, last_modified_time) VALUES ("' + req.body.partnername + '","' + req.body.Email + '","' + moment() + '","' + moment() + '")';
    console.log("query: " + query);
    connection.query(query, function(error, rows) {
      if(error == null) {
        console.log("MySQl Response: " + JSON.stringify(rows));
        return complete({}).ok().next();
      } else {
        console.log(error);
        return complete(error).runtimeError().next();
      }
    }) 
  }

  function formatResponse(row) {
    //TODO: LAB: format the response to match your expected JSON
    row._id = row.Id.toString();
    delete row.Id;
    row._kmd = {"ect":row.created_time, "lmt":row.last_modified_time};
    delete row.created_time;
    delete row.last_modified_time;
    row._acl = {};
    row.partnername = row.Name;
    delete row.Name;
    return row;
  }

  function debugInfo(req) {
    console.log("Query: ", req.query);
    console.log("EntityId: ", req.entityId);
    console.log("Body: ", req.body);
    console.log("SeviceObjectName: ", req.serviceObjectName);
    console.log("Method: ", req.method);
    console.log("Headers: ", req.headers);
  }
})