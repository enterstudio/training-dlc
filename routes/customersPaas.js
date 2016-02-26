var request = require("request");
var format = require('../lib/formatting');
var db = require('../db/json-server');
var sdk = require('kinvey-backend-sdk');

var apiServerUrl = "http://localhost:3000/customers";
console.log("hello world");

var service = sdk.service(function(err, service) {
  console.log('I have a service')
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

  function list(request, complete) {
    console.log("inside list");
//    request(
//      {
//        method: 'GET',
//        uri: format.outboundRequest(apiServerUrl, req)
//      },
//      function(error, response, body) {
//        console.log(JSON.stringify(response));
//        status == (error && error.status) || response.statusCode;
//        if(error == null && status == 200) {
//          body = JSON.parse(body);
//          body.forEach(function(customer) {
//            customer = formatResponse(customer);
//          });
          complete({"test":"response"}).ok().next();
//        } else {
//          console.log(error);
//          complete(error).runtimeError().next();
//        }
//      }
//    );
  };

  function create(request, complete) {
    console.log("inside create");
    request(
      {
        method: 'POST',
        uri: format.outboundRequest(apiServerUrl, req),
        json: format.request(req.body)
      },
      function(error, response, body) {
        console.log(JSON.stringify(response));
        status == (error && error.status) || response.statusCode;
        if(error == null && status == 201) {
          complete(formatResponse(body)).ok().next();
        } else {
          console.log(error);
          complete(error).runtimeError().next();
        }
      }
    );
  };

  function show(request, complete) {
    console.log("inside show");
    request(
      {
        method: 'GET',
        uri: format.outboundRequest(apiServerUrl, req)
      },
      function(error, response, body) {
        console.log(JSON.stringify(response));
        status == (error && error.status) || response.statusCode;
        if(error == null && status == 200) {
          body = JSON.parse(body);
          complete(formatResponse(body)).ok().next();
        } else {
          console.log(error);
          complete(error).runtimeError().next();
        }
      }
    );
  };

  function update(request, complete) {
    console.log("inside update");
    req.body = format.request(req.body);
    request(
      {
        method: 'PUT',
        uri: format.outboundRequest(apiServerUrl, request),
        json: req.body
      },
      function(error, response, body) {
        console.log(JSON.stringify(response));
        status == (error && error.status) || response.statusCode;
        if(error == null && status == 200) {
          res.send(formatResponse(body));
        } else {
          console.log(error);
          complete(error).runtimeError().next();
        }
      }
    );
  };

  function destroy(request, complete) {
    console.log("inside destroy");
    request(
      {
        method: 'DELETE',
        uri: format.outboundRequest(apiServerUrl, request)
      },
      function(error, response, body) {
        console.log(JSON.stringify(response));
        status == (error && error.status) || response.statusCode;
        if(error == null && status == 200) {
          body = {"count":1};
          res.status(200).send(body);
        } else {
          console.log(error);
          complete(error).runtimeError().next();
        }
      }
    );
  };

  function count(request, complete) {
    console.log("inside count");
    request(
      {
        method: 'GET',
        uri: format.outboundRequest(apiServerUrl, request)
      },
      function(error, response, body) {
        console.log(JSON.stringify(response));
        status == (error && error.status) || response.statusCode;
        if(error == null && status == 200) {
            body = JSON.parse(body);
            body = {"count": body.length};
            complete(body).ok().next();
        } else {
            console.log(error);
            complete(error).runtimeError().next();
          }
      }
    )
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

  var notImplementedHandler = function(request, complete) {
    complete("These methods are not implemented").notImplemented().done();
  };

});
