var request = require("request");
var format = require('../lib/formatting');
var db = require('../db/json-server');
var sdk = require('kinvey-backend-sdk');
var jsonServer = require('json-server')

var apiServerUrl = "https://9d0a6999.ngrok.io/customers";

var service = sdk.service(function(err, service) {
  var dataLink = service.dataLink;   // gets the datalink object from the service
  var customers = dataLink.serviceObject('customersPaas');

  if(err != null) {
    console.log(JSON.stringify(err));
  }

  // wire up the event that we want to process
  customers.onGetById(show);
  customers.onGetCount(count);
  customers.onGetAll(list);
  customers.onInsert(create);
  customers.onUpdate(update);
  customers.onDeleteById(destroy);
  // wire up the events that we are not implementing
  customers.onGetByQuery(notImplementedHandler);
  customers.onDeleteAll(notImplementedHandler);
  customers.onDeleteByQuery(notImplementedHandler);

  //TODO: won't deploy
//  setupJsonServer();

  function list(req, complete) {
    console.log("Query: ", req.query);
    console.log("EntityId: ", req.entityId);
    console.log("Body: ", req.body);
    console.log("SeviceObjectName: ", req.serviceObjectName);
    console.log("Method: ", req.method);
    console.log("Headers: ", req.headers);
    try {
      request(
        {
          method: 'GET',
          uri: format.outboundRequest(apiServerUrl, req)
        },
        function(error, response, body) {
          var status = (error && error.status) || response.statusCode;
          if(error == null && status == 200) {
            body = JSON.parse(body);
            body.forEach(function(customer) {
              customer = formatResponse(customer);
            });
            return complete(body).ok().next();
          } else {
            console.log(error);
            return complete(error).runtimeError().next();
          }
        }
      );
    } catch (e) {
      console.log(e.toString());
      return complete(e.toString()).runtimeError().next();
    }
  };

  function create(req, complete) {
    console.log("Query: ", req.query);
    console.log("EntityId: ", req.entityId);
    console.log("Body: ", req.body);
    console.log("SeviceObjectName: ", req.serviceObjectName);
    console.log("Method: ", req.method);
    console.log("Headers: ", req.headers);
    try {
      console.log("inside create");
      request(
        {
          method: 'POST',
          uri: format.outboundRequest(apiServerUrl, req),
          json: format.request(req.body)
        },
        function(error, response, body) {
          console.log(JSON.stringify(response));
          var status = (error && error.status) || response.statusCode;
          if(error == null && status == 201) {
            return complete(formatResponse(body)).ok().next();
          } else {
            console.log(error);
            return complete(error).runtimeError().next();
          }
        }
      );
    } catch (e) {
      console.log(e.toString());
      return complete(e.toString()).runtimeError().next();
    }
  };

  function show(req, complete) {
    console.log("Query: ", req.query);
    console.log("EntityId: ", req.entityId);
    console.log("Body: ", req.body);
    console.log("SeviceObjectName: ", req.serviceObjectName);
    console.log("Method: ", req.method);
    console.log("Headers: ", req.headers);
    try {
      console.log("inside show");
      request(
        {
          method: 'GET',
          uri: format.outboundRequest(apiServerUrl, req)
        },
        function(error, response, body) {
          console.log(JSON.stringify(response));
          console.log(error);
          console.log(body);
          var status = (error && error.status) || response.statusCode;
          if(error == null && status == 200) {
            body = JSON.parse(body);
            body = formatResponse(body);
            return complete(body).ok().next();
          } else {
            console.log(error);
            return complete(error).runtimeError().next();
          }
        }
      );
    } catch (e) {
      console.log(e.toString());
      return complete(e.toString()).runtimeError().next();
    }
  };

  function update(req, complete) {
    console.log("Query: ", req.query);
    console.log("EntityId: ", req.entityId);
    console.log("Body: ", req.body);
    console.log("SeviceObjectName: ", req.serviceObjectName);
    console.log("Method: ", req.method);
    console.log("Headers: ", req.headers);
    try {
      console.log("inside update");
      req.body = format.request(req.body);
      request(
        {
          method: 'PUT',
          uri: format.outboundRequest(apiServerUrl, req),
          json: req.body
        },
        function(error, response, body) {
          console.log(JSON.stringify(response));
          var status = (error && error.status) || response.statusCode;
          if(error == null && status == 200) {
            res.send(formatResponse(body));
          } else {
            console.log(error);
            return complete(error).runtimeError().next();
          }
        }
      );
    } catch (e) {
      console.log(e.toString());
      return complete(e.toString()).runtimeError().next();
    }
  };

  function destroy(req, complete) {
    console.log("Query: ", req.query);
    console.log("EntityId: ", req.entityId);
    console.log("Body: ", req.body);
    console.log("SeviceObjectName: ", req.serviceObjectName);
    console.log("Method: ", req.method);
    console.log("Headers: ", req.headers);
    try {
      console.log("inside destroy");
      request(
        {
          method: 'DELETE',
          uri: format.outboundRequest(apiServerUrl, req)
        },
        function(error, response, body) {
          console.log(JSON.stringify(response));
          var status = (error && error.status) || response.statusCode;
          if(error == null && status == 200) {
            body = {"count":1};
            res.status(200).send(body);
          } else {
            console.log(error);
            return complete(error).runtimeError().next();
          }
        }
      );
    } catch (e) {
      console.log(e.toString());
      return complete(e.toString()).runtimeError().next();
    }
  };

  function count(req, complete) {
    console.log("Query: ", req.query);
    console.log("EntityId: ", req.entityId);
    console.log("Body: ", req.body);
    console.log("SeviceObjectName: ", req.serviceObjectName);
    console.log("Method: ", req.method);
    console.log("Headers: ", req.headers);
    try {
      console.log("inside count");
      request(
        {
          method: 'GET',
          uri: format.outboundRequest(apiServerUrl, req)
        },
        function(error, response, body) {
          console.log(JSON.stringify(response));
          console.log(error);
          console.log(body);
          var status = (error && error.status) || response.statusCode;
          if(error == null && status == 200) {
              body = JSON.parse(body);
              body = {"count": body.length};
              return complete(body).ok().next();
          } else {
              console.log(error);
              return complete(error).runtimeError().next();
            }
        }
      );
    } catch (e) {
      console.log(e.toString());
      return complete(e.toString()).runtimeError().next();
    }
  }

  function formatResponse(body) {
    body._id = body.id.toString();
    delete body.id;
    body._kmd = {"ect":body.created_time, "lmt":body.last_modified_time};
    delete body.created_time;
    delete body.last_modified_time;
    body._acl = {};
    delete body.foo;
    return body;
  }

  var notImplementedHandler = function(req, complete) {
    return complete("These methods are not implemented").notImplemented().done();
  };

});

var setupJsonServer = function() {
  var router = jsonServer.router('db.json') // Express router
  var server = jsonServer.create()       // Express server

  server.use(router)
  server.listen(3000)
}