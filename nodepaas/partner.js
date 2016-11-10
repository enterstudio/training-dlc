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

  // common functions
  // function notImplementedHandler(req, complete) {
  // 	handleResponse(statuscodes.notImplemented,"This goes in the output as debug message!", complete);
  // }

  function handleResponse(responsecode, bodyOrDebug, complete){
    switch(responsecode) {
      case 201:
        return complete(bodyOrDebug).created().next();
        break;
      case 200:
        return complete(bodyOrDebug).ok().next();
        break;
      case 404:
          return complete(bodyOrDebug).notFound().next();
          break;
      case 400:
          return complete(bodyOrDebug).badRequest().next();
          break;
      case 401:
          return complete(bodyOrDebug).unauthorized().next();
          break;
      case 403:
          return complete(bodyOrDebug).forbidden().next();
          break;
      case 405:
          return complete(bodyOrDebug).notAllowed().next();
          break;
      case 501:
          return complete(bodyOrDebug).notImplemented().next();
          break;
      case 550:
      default:
          return complete(bodyOrDebug).runtimeError().next();
    }
  }

  // synchronous functions
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

  function mapQueryKinveyToMysql(query) {
    if (query._id) {
      query.Id = query._id;
      delete query._id;
    }
    if (query["_kmd.ect"]) {
      query.created_time = query["_kmd.ect"];
      delete query["_kmd.ect"];
    }
    if (query["_kmd.lmt"]) {
      query.last_modified_time = query["_kmd.lmt"];
      delete query["_kmd.lmt"];
    }
    return query;
  }

  // promises
  function constructMySQLquery(method, req) {
    return new Promise(function (fulfill, reject){
      var query = "";
      switch(method) {
        case "onUpdate":
          var body = mapRowKinveyToMysql(req.body);
          query = 'UPDATE partner SET ?';
          query = mysql.format(query, body);
          query += ' WHERE Id=' + req.entityId + ';';
          break;
        case "onGetCount":
          query = "SELECT COUNT(*) AS count FROM partner;";
          break;
        case "onGetCountByQuery":
          query = "SELECT COUNT(*) AS count FROM partner " + parseQuery(req.query) + ";";
          break;
        case "onDeleteById":
          query = "DELETE FROM partner WHERE Id=" + req.entityId + ";";
          break;
        case "onDeleteByQuery":
          query = "DELETE FROM partner " + parseQuery(req.query) + ";";
          break;
        case "onInsert":
          var body = mapRowKinveyToMysql(req.body);
          query = 'INSERT INTO partner SET ?';
          query = mysql.format(query, body);
          break;
        case "onGetById":
          query = "SELECT * FROM partner WHERE Id=" + req.entityId + ";";
          break;
        case "onGetByQuery":
          query = "SELECT * FROM partner " + parseQuery(req.query) + ";";
          break;
        case "onGetAll":
        default:
          query+= "SELECT * FROM partner;";
      }
      console.log(query);
      fulfill(query);
    });
  }

  function parseQuery(query) {
    var mysqlQuery = "";
    // handling http://devcenter.kinvey.com/rest/guides/datastore#operators
    // implicit AND is default
    var filters = JSON.parse(query.query);
    filters = mapQueryKinveyToMysql(filters);
    for (var filter in filters) {
      var filtervalue = filters[filter];
      if (typeof filtervalue === 'string' || typeof filtervalue === 'number') {
        if (mysqlQuery === "") {
          mysqlQuery += " WHERE ";
        } else {
          mysqlQuery += " AND ";
        }
        mysqlQuery += filter + " = '" + filtervalue + "'";
      }
      // else {
        // explicit AND/OR not handled
        // comparison operators not handled
      // }
    }

    delete query.query;
    // handling http://devcenter.kinvey.com/rest/guides/datastore#modifiers
    if (query.limit) {
      mysqlQuery += " LIMIT " + query.limit;
    }
    if (query.skip) {
      mysqlQuery += " OFFSET " + query.skip;
    }
    // if (query.sort) {
      // sort not handled
    // }
    // if (query.fields) {
      // fields not handled      
    // }

    console.log(mysqlQuery);
    return mysqlQuery;
  }

  function establishMySQLConnectionAndExecuteMySQLQuery(query) {
    return new Promise(function (fulfill, reject){
      var connection = mysql.createConnection(mysqlConnectionInfo);
      connection.connect(function(err) {
        if (err) {
          console.error('error connecting: ' + err.stack);
          reject(err);
        } else {
          console.log('connected as id ' + connection.threadId);
          connection.query({sql: query}, function (err, rows) {
            if (err) {
              console.error('error executing: ' + err.stack);
              reject(err);
            } else {
              console.log(rows);
              fulfill(rows);
            }
          });
        }
      });
    });
  }

  function processMySQLGetOutput(rows){
    return new Promise(function (fulfill, reject){
      rows.forEach(function(row) {
        row = mapRowMysqlToKinvey(row);
      });
      fulfill(rows);
    });
  }

  function processMySQLGetOneOutput(rows) {
    return new Promise(function (fulfill, reject){
      fulfill(mapRowMysqlToKinvey(rows[0]));
    });
  }

  function processMySQLPostOutput(rows){
    return new Promise(function (fulfill, reject){
      var query = "SELECT * FROM partner WHERE Id=" + rows.insertId + ";";
      fulfill(query);
    });
  }

  function processMySQLPutOutput(entityId){
    return new Promise(function (fulfill, reject){
      var query = "SELECT * FROM partner WHERE Id=" + entityId + ";";
      console.log(query);
      fulfill(query);
    });
  }

  function processMySQLDeleteOuput(rows) {
    return new Promise(function (fulfill, reject){
      fulfill({ count : rows.affectedRows});
    });
  }

  function processMySQLCountOutput(rows) {
    return new Promise(function (fulfill, reject){
      fulfill({ count : rows[0].count});
    });
  }

  // all possible API calls
  // onGetAll get all entities in a given ServiceObject
  partner.onGetAll(function(req, complete){
    constructMySQLquery("onGetAll", req)
      .then(establishMySQLConnectionAndExecuteMySQLQuery)
      .then(processMySQLGetOutput)
      .then(function (result) {
        handleResponse(statuscodes.ok, result, complete);
      }).catch(function (err) {
        console.log("here in catch err");
        handleResponse(statuscodes.runtimeError, err.stack, complete);
      });
  });
  // onGetById  get a single entity by Id
  partner.onGetById(function(req, complete){
    constructMySQLquery("onGetById", req)
      .then(establishMySQLConnectionAndExecuteMySQLQuery)
      .then(processMySQLGetOneOutput)
      .then(function(result){
        handleResponse(statuscodes.ok, result, complete);
      }).catch(function(err){
        handleResponse(statuscodes.runtimeError, err.stack, complete);
      });
  });
  // onInsert executed on inserts (or POST to REST API)
  partner.onInsert(function(req, complete) {
    // TODO to be tested thoroughly
    constructMySQLquery("onInsert", req)
      .then(establishMySQLConnectionAndExecuteMySQLQuery)
      .then(processMySQLPostOutput)
      .then(establishMySQLConnectionAndExecuteMySQLQuery)
      .then(processMySQLGetOneOutput)
      .then(function(result){
        handleResponse(statuscodes.created, result, complete);
      }).catch(function(err){
        handleResponse(statuscodes.runtimeError, err.stack, complete);
      });
  });
  // onDeleteById executed when a single entity is to be deleted
  partner.onDeleteById(function(req, complete){
    constructMySQLquery("onDeleteById", req)
      .then(establishMySQLConnectionAndExecuteMySQLQuery)
      .then(processMySQLDeleteOuput)
      .then(function(result){
        handleResponse(statuscodes.ok, result, complete);
      }).catch(function(err){
        handleResponse(statuscodes.runtimeError, err.stack, complete);
      });
  });
  // onGetCount get the count of the entities in a ServiceObject
  partner.onGetCount(function(req, complete){
    constructMySQLquery("onGetCount", req)
      .then(establishMySQLConnectionAndExecuteMySQLQuery)
      .then(processMySQLCountOutput)
      .then(function(result){
        handleResponse(statuscodes.ok, result, complete);
      }).catch(function(err){
        handleResponse(statuscodes.runtimeError, err.stack, complete);
      });
  });

  // onUpdate executed on updates (or PUT to the REST API)
  partner.onUpdate(function(req, complete){
    var entityId = req.entityId;
    constructMySQLquery("onUpdate", req)
      .then(establishMySQLConnectionAndExecuteMySQLQuery)
      .then(function(rows){
        return processMySQLPutOutput(entityId);
      })
      .then(establishMySQLConnectionAndExecuteMySQLQuery)
      .then(processMySQLGetOneOutput)
      .then(function(result){
        handleResponse(statuscodes.ok, result, complete);
      }).catch(function(err){
        handleResponse(statuscodes.runtimeError, err.stack, complete);
      });
  });

  // onDeleteAll  executed when the DELETE command is invoked
  partner.onDeleteAll(
    function(req, complete){
      handleResponse(statuscodes.notImplemented,"This goes in the output as debug message! Not implemented for security reasons.", complete);
    }
  );

  // onGetByQuery retrieve results based on a query
  partner.onGetByQuery(function(req, complete){
    constructMySQLquery("onGetByQuery", req)
      .then(establishMySQLConnectionAndExecuteMySQLQuery)
      .then(processMySQLGetOutput)
      .then(function(result){
        handleResponse(statuscodes.ok, result, complete);
      }).catch(function(err){
        handleResponse(statuscodes.runtimeError, err.stack, complete);
      });
  });

  // onGetCountByQuery  get the count of the entities in a query result
  partner.onGetCountByQuery(function(req, complete){
    constructMySQLquery("onGetCountByQuery", req)
      .then(establishMySQLConnectionAndExecuteMySQLQuery)
      .then(processMySQLCountOutput)
      .then(function(result){
        handleResponse(statuscodes.ok, result, complete);
      }).catch(function(err){
        handleResponse(statuscodes.runtimeError, err.stack, complete);
      });
  });

  // onDeleteByQuery  executed when a query is included as part of a DELETE
  partner.onDeleteByQuery(function(req, complete){
    constructMySQLquery("onDeleteByQuery", req)
      .then(establishMySQLConnectionAndExecuteMySQLQuery)
      .then(processMySQLDeleteOuput)
      .then(function(result){
        handleResponse(statuscodes.ok, result, complete);
      }).catch(function(err){
        handleResponse(statuscodes.runtimeError, err.stack, complete);
      });
  });

});
