var sdk = require('kinvey-backend-sdk');
var mysql = require('mysql');
var moment = require("moment");

var mysqlConnectionInfo = {
	"host" : "training-mysql.cbefmmhfdivt.us-east-1.rds.amazonaws.com",
	"user" : "training",
	"password" : "kinveysql",
	"database" : "training"
};

var statuscodes = {
  ok: 200,
  created: 201,
  accepted: 202,
  notFound: 404,
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  notAllowed: 405,
  notImplemented: 501,
  runtimeError: 550
}

var service = sdk.service(function(err, service) {
  var dataLink = service.dataLink;
  var partner = dataLink.serviceObject('waniPartnerPaaS');

  // all possible API calls
  // onInsert	executed on inserts (or POST to REST API)
  partner.onInsert(function(req, complete) {
    // TODO to be tested
    var body = mapRowKinveyToMysql(req.body);
    var query = 'INSERT INTO partner SET ?';
    query = mysql.format(query, body);
    runMysqlQuery("POST", query, complete);
  });
  // onUpdate	executed on updates (or PUT to the REST API)
  // onDeleteById	executed when a single entity is to be deleted
  partner.onDeleteById(function(req, complete){
    var query = "DELETE FROM partner WHERE Id=" + req.entityId + ";";
    runMysqlQuery("DELETE", query, complete);
  });
  // onDeleteByQuery	executed when a query is included as part of a DELETE
  // onDeleteAll	executed when the DELETE command is invoked
  // onGetById	get a single entity by Id
  partner.onGetById(function(req, complete){
    var query = "SELECT * FROM partner WHERE Id=" + req.entityId + ";";
    runMysqlQuery("GETONE", query, complete);
  });
  // onGetByQuery	retrieve results based on a query
  partner.onGetByQuery(function(req, complete){
    var query = "SELECT * FROM partner ";
    query += parseQuery(req.query.query);
    query += ";";
    runMysqlQuery("GET", query, complete);
  });
  // onGetAll	get all entities in a given ServiceObject
  partner.onGetAll(function(req, complete){
    var query = "SELECT * FROM partner;";
    runMysqlQuery("GET", query, complete);
  });
  // onGetCount	get the count of the entities in a ServiceObject
  partner.onGetCount(function(req, complete){
    var query = "SELECT COUNT(*) AS count FROM partner;";
    runMysqlQuery("COUNT", query, complete);
  });
  // onGetCountByQuery	get the count of the entities in a query result
  partner.onGetCountByQuery(function(req, complete){
    var query = "SELECT COUNT(*) AS count FROM partner ";
    query += parseQuery(req.query.query);
    query += ";";
    runMysqlQuery("COUNT", query, complete);
  });

  // common functions
  function notImplementedHandler(req, complete) {
  	handleErrors(statuscodes.notImplemented,"This goes in the output as debug message!", complete);
  }

  function runMysqlQuery(method, query, complete) {
    var connection = mysql.createConnection(mysqlConnectionInfo);
    connection.connect(function(err) {
      if (err) {
        console.error('error connecting: ' + err.stack);
        handleErrors(statuscodes.runtimeError, "Error connecting to the database", complete);
      } else {
        console.log('connected as id ' + connection.threadId);
        connection.query({sql: query}, function (err, rows) {
          if (err) {
            console.error('error executing: ' + err.stack);
            handleErrors(statuscodes.runtimeError, "Error running the query - " + err.code, complete);
          } else {
            console.log(rows);
            // process body
            switch(method) {
              case "GET":
                processGetOutput(rows, complete);
                break;
              case "GETONE":
                processGetOneOutput(rows, complete);
                break;
              case "POST":
                processPostOutput(rows, complete);
                break;
              case "PUT":
                processPutOutput(rows, complete);
                break;
              case "DELETE":
                handleSuccess(statuscodes.ok, { count : rows.affectedRows}, complete);
                break;
              case "COUNT":
                handleSuccess(statuscodes.ok, { count : rows[0].count}, complete);
                break;
              default:
                handleErrors(statuscodes.runtimeError, "Invalid method - highly unlikely", complete);
            }            
          }
        });
      }
    });
  }

  function handleSuccess(successcode, body, complete){
    switch(successcode) {
      case 201:
        return complete(body).created().next();
        break;
      case 200:
      default:
        return complete(body).ok().next();
    }
  }

  function handleErrors(errorcode, debug, complete) {
    switch(errorcode) {
      case 404:
          return complete(debug).notFound().next();
          break;
      case 400:
          return complete(debug).badRequest().next();
          break;
      case 401:
          return complete(debug).unauthorized().next();
          break;
      case 403:
          return complete(debug).forbidden().next();
          break;
      case 405:
          return complete(debug).notAllowed().next();
          break;
      case 501:
          return complete(debug).notImplemented().next();
          break;
      case 550:
      default:
          return complete(debug).runtimeError().next();
    }
  }

  function parseQuery(querystring) {
    var query = JSON.parse(querystring);
    // TODO this is remaining
    return "WHERE Name = 'Elon'";
  }

  function handleModifiers() {
    // TODO this is remaining
    return "";
  }

  function processGetOutput(rows, complete) {
    rows.forEach(function(row) {
      row = mapRowMysqlToKinvey(row);
    });
    handleSuccess(statuscodes.ok, rows, complete);
  }

  function processGetOneOutput(rows, complete) {
    handleSuccess(statuscodes.ok, mapRowMysqlToKinvey(rows[0]), complete);
  }

  function processPostOutput(rows, complete){
    // console.log(rows.insertId);
    var query = "SELECT * FROM partner WHERE Id=" + rows.insertId + ";";
    runMysqlQuery("GETONE", query, complete);
    // handleErrors(statuscodes.notImplemented, "Not complete yet! Check logs", complete);
  }

  function mapRowMysqlToKinvey(row) {
    row._id = row.Id;
    delete row.Id;
    row._kmd = {
      ect: row.created_time,
      lmt: row.last_modified_time
    }
    delete row.created_time;
    delete row.last_modified_time;
    row._acl = {};
    return row;
  }

  function mapRowKinveyToMysql(row) {
    row.Id = row._id;
    delete row._id;
    if (row._kmd){
      if(!row._kmd.ect) {
        row._kmd.ect = moment().toISOString();
      }
      if(!row._kmd.lmt) {
        row._kmd.lmt = moment().toISOString();
      }
    } else {
      row._kmd = { 
        ect : moment().toISOString(),
        lmt : moment().toISOString()
      };
    }
    row.created_time = row._kmd.ect;
    row.last_modified_time = row._kmd.lmt;
    delete row._kmd;
    delete row._acl;
    return row;
  }
});