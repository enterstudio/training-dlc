var sdk = require('kinvey-backend-sdk');
var mysql = require('mysql');
var moment = require("moment");
var async = require("async");

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
  function notImplementedHandler(req, complete) {
  	handleResponse(statuscodes.notImplemented,"This goes in the output as debug message!", complete);
  }

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

  function mapKinveyQueryToMysql(query) {
    if (query._id) {
      query.Id = query._id;
      delete query._id;
    }
    if (query["_kmd.ect"]) {
      query.created_time = query.["_kmd.ect"];
      delete query["_kmd.ect"];
    }
    if (query["_kmd.lmt"]) {
      query.last_modified_time = query.["_kmd.lmt"];
      delete query["_kmd.lmt"];
    }
    return query;
  }

  // async waterfall functions
  function constructMySQLquery(method, req, callback) {
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
        console.log(query);
        break;
      case "onGetAll":
      default:
        query+= "SELECT * FROM partner;";
    }
    callback(null, query);
  }

  function parseQuery(query) {
    var mysqlQuery = "";
    console.log(query);
    // handling http://devcenter.kinvey.com/rest/guides/datastore#operators
    // implicit AND is default
    var filters = JSON.parse(query.query);
    console.log(filters);
    for (var filter in filters) {
      console.log(filter);
      var filtervalue = filters[filter];
      console.log(filtervalue);
      console.log(typeof filtervalue);
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
    console.log(query);
    if (query.limit) {
      // console.log(query.limit);
      mysqlQuery += " LIMIT " + query.limit;
    }
    if (query.skip) {
      // console.log(query.skip);      
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

  function establishMySQLConnection(query, callback) {
    var connection = mysql.createConnection(mysqlConnectionInfo);
    connection.connect(function(err) {
      if (err) {
        console.error('error connecting: ' + err.stack);
        // handleResponse(statuscodes.runtimeError, "Error connecting to the database", complete);
        callback(err);
      }
      console.log('connected as id ' + connection.threadId);
      callback(null, connection, query);
    });
  }

  function executeMySQLQuery(connection, query, callback) {
    connection.query({sql: query}, function (err, rows) {
      if (err) {
        console.error('error executing: ' + err.stack);
        // handleResponse(statuscodes.runtimeError, "Error running the query - " + err.code, complete);
        callback(err);
      }
      console.log(rows);
      // process body
      callback(null, rows);
    });
  }

  function processMySQLGetOutput(rows, callback){
    rows.forEach(function(row) {
      row = mapRowMysqlToKinvey(row);
    });
    callback(null, rows);
  }

  function processMySQLGetOneOutput(rows, callback) {
    callback(null, mapRowMysqlToKinvey(rows[0]));
  }

  function processMySQLPostOutput(rows, callback){
    // console.log(rows);
    var query = "SELECT * FROM partner WHERE Id=" + rows.insertId + ";";
    callback(null, query);
    // handleResponse(statuscodes.notImplemented, "Not complete yet! Check logs", complete);
  }

  function processMySQLPutOutput(entityId, rows, callback){
    console.log(entityId);
    console.log(rows);
    console.log(typeof callback);
    var query = "SELECT * FROM partner WHERE Id=" + entityId + ";";
    callback(null, query);
    // handleResponse(statuscodes.notImplemented, "Not complete yet! Check logs", complete);
  }

  function processMySQLDeleteOuput(rows, callback) {
    callback(null, { count : rows.affectedRows});
  }

  function processMySQLCountOutput(rows, callback) {
    callback(null, { count : rows[0].count});
  }

  // all possible API calls
  // onGetAll get all entities in a given ServiceObject
  partner.onGetAll(function(req, complete){
    async.waterfall([
        async.apply(constructMySQLquery, "onGetAll", req),
        establishMySQLConnection,
        executeMySQLQuery,
        processMySQLGetOutput
    ], function (err, result) {
        // result now equals 'done'
        if (err) {
          handleResponse(statuscodes.runtimeError, err.stack, complete);
        } else {
          handleResponse(statuscodes.ok, result, complete);
        }
    });
  });
  // onGetById  get a single entity by Id
  partner.onGetById(function(req, complete){
    async.waterfall([
        async.apply(constructMySQLquery, "onGetById", req),
        establishMySQLConnection,
        executeMySQLQuery,
        processMySQLGetOneOutput
    ], function (err, result) {
        if (err) {
          handleResponse(statuscodes.runtimeError, err.stack, complete);
        } else {
          handleResponse(statuscodes.ok, result, complete);
        }
    });
  });
  // onInsert executed on inserts (or POST to REST API)
  partner.onInsert(function(req, complete) {
    // TODO to be tested thoroughly
    async.waterfall([
        async.apply(constructMySQLquery, "onInsert", req),
        establishMySQLConnection,
        executeMySQLQuery,
        processMySQLPostOutput,
        establishMySQLConnection,
        executeMySQLQuery,
        processMySQLGetOneOutput
    ], function (err, result) {
        if (err) {
          handleResponse(statuscodes.runtimeError, err.stack, complete);
        } else {
          handleResponse(statuscodes.created, result, complete);
        }
    });
  });
  // onDeleteById executed when a single entity is to be deleted
  partner.onDeleteById(function(req, complete){
    async.waterfall([
        async.apply(constructMySQLquery, "onDeleteById", req),
        establishMySQLConnection,
        executeMySQLQuery,
        processMySQLDeleteOuput
    ], function (err, result) {
        if (err) {
          handleResponse(statuscodes.runtimeError, err.stack, complete);
        } else {
          handleResponse(statuscodes.ok, result, complete);
        }
    });
  });
  // onGetCount get the count of the entities in a ServiceObject
  partner.onGetCount(function(req, complete){
    async.waterfall([
        async.apply(constructMySQLquery, "onGetCount", req),
        establishMySQLConnection,
        executeMySQLQuery,
        processMySQLCountOutput
    ], function (err, result) {
        if (err) {
          handleResponse(statuscodes.runtimeError, err.stack, complete);
        } else {
          handleResponse(statuscodes.ok, result, complete);
        }
    });
  });

  // onUpdate executed on updates (or PUT to the REST API)
  partner.onUpdate(function(req, complete){
    // console.log(req);
    async.waterfall([
        async.apply(constructMySQLquery, "onUpdate", req),
        establishMySQLConnection,
        executeMySQLQuery,
        async.apply(processMySQLPutOutput, req.entityId),
        establishMySQLConnection,
        executeMySQLQuery,
        processMySQLGetOneOutput
    ], function (err, result) {
        if (err) {
          handleResponse(statuscodes.runtimeError, err.stack, complete);
        } else {
          handleResponse(statuscodes.ok, result, complete);
        }
    });
  });

  // onDeleteAll  executed when the DELETE command is invoked
  // won't be implementing this for security reasons
  partner.onDeleteAll(notImplementedHandler);

  // onGetByQuery retrieve results based on a query
  partner.onGetByQuery(function(req, complete){
    async.waterfall([
        async.apply(constructMySQLquery, "onGetByQuery", req),
        establishMySQLConnection,
        executeMySQLQuery,
        processMySQLGetOutput
    ], function (err, result) {
        if (err) {
          handleResponse(statuscodes.runtimeError, err.stack, complete);
        } else {
          handleResponse(statuscodes.ok, result, complete);
        }
    });
  });

  // onGetCountByQuery  get the count of the entities in a query result
  partner.onGetCountByQuery(function(req, complete){
    async.waterfall([
        async.apply(constructMySQLquery, "onGetCountByQuery", req),
        establishMySQLConnection,
        executeMySQLQuery,
        processMySQLCountOutput
    ], function (err, result) {
        if (err) {
          handleResponse(statuscodes.runtimeError, err.stack, complete);
        } else {
          handleResponse(statuscodes.ok, result, complete);
        }
    });
  });

  // TODO the ones below are remaining
  // onDeleteByQuery  executed when a query is included as part of a DELETE
  partner.onDeleteByQuery(function(req, complete){
    // var query = "SELECT * FROM partner ";
    // query += parseQuery(req.query);
    // query += ";";
    // console.log(query);
    // // runMysqlQuery("GET", query, complete);
    // notImplementedHandler(req,complete);
    async.waterfall([
        async.apply(constructMySQLquery, "onDeleteByQuery", req),
        establishMySQLConnection,
        executeMySQLQuery,
        processMySQLDeleteOuput
    ], function (err, result) {
        if (err) {
          handleResponse(statuscodes.runtimeError, err.stack, complete);
        } else {
          handleResponse(statuscodes.ok, result, complete);
        }
    });
  });

});
