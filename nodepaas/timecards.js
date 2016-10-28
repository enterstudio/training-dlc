var sdk = require('kinvey-backend-sdk');
var request = require("request");

var service = sdk.service(function(err, service) {
  var dataLink = service.dataLink;
  var timecards = dataLink.serviceObject('timecards');

  if(err != null) {
    console.log(JSON.stringify(err));
  }

  timecards.onGetById(show);

  function show(req, complete) {
    var apiServerUrl = "https://mblvbdmz1.mitre.org/trs-d/app/kinvey/timecards/37176";
    //TODO: add appropriate security headers (x-kinvey, mmerrill)
    request({method: 'GET', uri: apiServerUrl}, function(error, response, body) {
      res.status((error && error.status) || response.statusCode);
      if(error == null && res.statusCode == 200) {
        //on success convert to the correct format and respond
        body = JSON.parse(body);
        return complete(body).ok().next();
      } else {
        //on failure: log the error and ensure that a clean error message is returned
        console.log(error);
        return complete(error).runtimeError().next();
      }
    })
  };
});