var sdk = require('kinvey-backend-sdk');
var mysql = require('mysql');
const cronjob = require('./cronjob.js');

var service = sdk.service(function(err, service) {
  var dataLink = service.dataLink;   // gets the datalink object from the service

  setInterval(function(){console.log("periodic ping")},10000);
  setInterval(cronjob.getAndUpdateData, 60000);

  var partner = dataLink.serviceObject('Partner');

  if(err != null) {
    console.log(JSON.stringify(err));
  }

  // wire up the event that we want to process
  partner.onGetById(show);
  partner.onGetAll(list);
  partner.onGetCount(count);

  function show(req, complete) {
    debugInfo(req);
    var connection = mysql.createConnection({
      host     : 'training-mysql.cbefmmhfdivt.us-east-1.rds.amazonaws.com',
      user     : 'training',
      password : 'kinveysql',
      database : "training"
    });

    connection.query('SELECT * FROM partner WHERE id = ' + req.entityId, function(error, rows) {
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

  function list(req, complete) {
    debugInfo(req);
    var connection = mysql.createConnection({
      host     : 'training-mysql.cbefmmhfdivt.us-east-1.rds.amazonaws.com',
      user     : 'training',
      password : 'kinveysql',
      database : "training"
    });

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
      var connection = mysql.createConnection({
        host     : 'training-mysql.cbefmmhfdivt.us-east-1.rds.amazonaws.com',
        user     : 'training',
        password : 'kinveysql',
        database : "training"
      });

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

  function formatResponse(row) {
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