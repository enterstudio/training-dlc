var express = require("express");
var request = require("request");

var router = express.Router();
//TODO: replace with your external data source
var authServerUrl = "";

router.route('/').post(auth); // POST {alc_url}

function auth(req, res, next) {
  //TODO: build the request body to the external auth
  //request comes in as {username: <string>,password: <string>}
  var body = {};
  request(
    {
      method: 'POST',
      uri: authServerUrl,
      //translate the JSON body into a format the external data can save
      json: body,
      options: {
        //TODO: add necessary headers
      }
    },
    function(error, response, body) {
      res.status((error && error.status) || response.statusCode);
      if(error == null) {
        //TODO: resonse must be in a form Kinvey recognizes
        //{authenticated: true,token: ""}
        //response body must be utf-8 encoded
        //content-type must be set to application/json
        //token must be a Base64 encoded string. It string should include all enterprise tokens.
        res.send(body);
      } else {
        console.log(error);
        //send a 401 unauthorized with no response body
        res.send({});
      }
    }
  );
}

module.exports = router;