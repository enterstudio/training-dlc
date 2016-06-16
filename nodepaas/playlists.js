var request = require("request");
var moment = require("moment");
var format = require('../lib/formatting');
var sdk = require('kinvey-backend-sdk');

var apiServerUrl = "https://api.spotify.com/v1/artists";

var service = sdk.service(function(err, service) {
  var dataLink = service.dataLink;   // gets the datalink object from the service
  var artists = dataLink.serviceObject('artists');

  if(err != null) {
    console.log(JSON.stringify(err));
  }

  // wire up the event that we want to process
  artists.onGetById(show);
  artists.onGetByQuery(query);
  // wire up the events that we are not implementing
  artists.onGetCount(notImplementedHandler);
  artists.onGetAll(notImplementedHandler);
  artists.onInsert(notImplementedHandler);
  artists.onUpdate(notImplementedHandler);
  artists.onDeleteById(notImplementedHandler);
  artists.onDeleteAll(notImplementedHandler);
  artists.onDeleteByQuery(notImplementedHandler);
//  artists.onGetCountByQuery(notImplementedHandler);

  function query(req, complete) {
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
          uri: outboundRequest(apiServerUrl, req)
        },
        function(error, response, body) {
          var status = (error && error.status) || response.statusCode;
          if(error == null && status == 200) {
            body = JSON.parse(body);
            body.artists.forEach(function(artist) {
              artist = formatResponse(artist);
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

  function show(req, complete) {
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
          uri: outboundRequest(apiServerUrl, req)
        },
        function(error, response, body) {
          console.log(JSON.stringify(response));
          console.log(error);
          console.log(body);
          var status = (error && error.status) || response.statusCode;
          if(error == null && status == 200) {
            body = JSON.parse(body);
            body = formatResponse(body)
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

  function outboundRequest(apiServerUrl, req) {
    var outboundRequest = apiServerUrl;
    // Kinvey sends ids in the REST style and the datasource receives them the same way
    //TODO: LAB: add the id to the outbound REST call
    if(req.entityId) {
      outboundRequest += '/' + req.entityId;
    }
    if (req.query && req.query && req.query._ids && req.query._ids["$in"]) {
      var params = req.query._ids["$in"].join();
      outboundRequest += "?id=" + params;
    }
    console.log("Outbound Request:", outboundRequest);
    return outboundRequest;
  }

  function formatResponse(body) {
    body._id = body.id.toString();
    delete body.id;
    body._kmd = {"ect":moment(), "lmt":moment()};
    body._acl = {};
    return body;
  }

  var notImplementedHandler = function(req, complete) {
    return complete("These methods are not implemented").notImplemented().done();
  };

});