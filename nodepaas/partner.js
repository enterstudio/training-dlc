var sdk = require('kinvey-backend-sdk');
var mysql = require('mysql');

var mysqlConnectionInfo = {
	"host" : "training-mysql.cbefmmhfdivt.us-east-1.rds.amazonaws.com",
	"user" : "training",
	"password" : "kinveysql",
	"database" : "training"
};

var service = sdk.service(function(err, service) {
  var dataLink = service.dataLink;
  var partner = dataLink.serviceObject('waniPartnerPaaS');

  // all possible API calls
  // onInsert	executed on inserts (or POST to REST API)
  partner.onInsert(notImplementedHandler);
  // onUpdate	executed on updates (or PUT to the REST API)
  partner.onUpdate(notImplementedHandler);
  // onDeleteById	executed when a single entity is to be deleted
  partner.onDeleteById(notImplementedHandler);
  // onDeleteByQuery	executed when a query is included as part of a DELETE
  partner.onDeleteByQuery(notImplementedHandler);
  // onDeleteAll	executed when the DELETE command is invoked
  partner.onDeleteAll(notImplementedHandler);
  // onGetById	get a single entity by Id
  partner.onGetById(notImplementedHandler);
  // onGetByQuery	retrieve results based on a query
  partner.onGetByQuery(notImplementedHandler);
  // onGetAll	get all entities in a given ServiceObject
  partner.onGetAll(function (req, complete) {
  	var connection = mysql.createConnection(mysqlConnectionInfo);	 
	connection.connect(function(err) {
	  if (err) {
	    console.error('error connecting: ' + err.stack);
	  }	 
	  console.log('connected as id ' + connection.threadId);
	  return complete([{"test": "return"}]).ok().done();
	});
  });
  // onGetCount	get the count of the entities in a ServiceObject
  partner.onGetCount(function (req, complete) {
  	return complete({"count": 7}).ok().done();
  });
  // onGetCountByQuery	get the count of the entities in a query result
  partner.onGetCountByQuery(function (req, complete) {
  	return complete("Damn!").notImplemented().done();
  });

  // common functions
  function notImplementedHandler(req, complete) {
  	return complete("Damn! Trump has got ya!").notImplemented().done();
  }
});