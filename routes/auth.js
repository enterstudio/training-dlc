var express = require("express");
var request = require("request");

var format = require('../lib/formatting');

var router = express.Router();
//TODO: replace with your external data source
var authServerUrl = "";

router.route('/').post(auth); // POST {alc_url}

function auth(req, res, next) {
  //TODO: build the request body to the external auth
  //request comes in as {username: <string>,password: <string>}
    //TODO: uncomment when real auth Server will be used
  //request(
  //  {
  //    method: 'POST',
  //    uri: authServerUrl,
  //    //translate the JSON body into a format the external data can save
  //    json: body,
  //    options: {
  //      //TODO: add necessary headers (if any)
  //    }
  //  },
  //  function(error, response, body) {
  //    console.log("response status: " + response.statusCode);
  //    var responseBody = {};
  //    if(error == null) {
  //      //TODO: response must be in a form Kinvey recognizes
  //      //response body must be utf-8 encoded
  //      //content-type must be set to application/json
  //      //token must be a Base64 encoded string. It string should include all enterprise tokens.
  //      var session = new Buffer(token).toString('base64');
  //      responseBody = {authenticated: true,token: session}
  //      res.status(200);
  //    } else {
  //      console.log(error);
  //      //send a 401 unauthorized with no response body
  //      res.status(401);
  //    }
  //    res.send(responseBody);
  //  }
  //);
  var body = format.request(req.body);
  var requiredUsername = "custom";
  var requiredPassword = "1234";

  var resultBody = {};
  if(body.username == requiredUsername && body.password == requiredPassword){
    //TODO: LAB: return the body needed by MIC
    res.status(200);
    resultBody.authenticated = true;
    resultBody.token = new Buffer("some-mic-encoded-token").toString('base64');
  }else{
    //TODO: LAB: return a valid error response to MIC
    res.status(401);
    resultBody.authError = "Custom MIC error";
  }
  res.send(resultBody);
}

module.exports = router;
