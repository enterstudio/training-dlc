var express = require("express");
var request = require("request");
var moment = require("moment");

var router = express.Router();
//Url for the external data source.
//TODO: replace with your external data source
var apiServerUrl = "http://localhost:3000/customers";

router.route('/')
    .get(list) // GET {dlc_url}/customers
    .post(create); // POST {dlc_url}/customers

router.route('/:id')
    .get(show) // GET {dlc_url}/customers/:id
    .put(update) // PUT {dlc_url}/customers/:id
    .delete(destroy);// DELETE {dlc_url}/customers/:id

/*
 * GET http://baas.kinvey.com/appdata/{kid_id}/customers
 * GET http://{DLC_url}/customers
 * Receives no parameters and send back an array of customers objects
 */
function list(req, res, next) {
  //create an external API request
  //no translation necessary because the external API is REST
  request(
    {
      method: 'GET',
      uri: apiServerUrl
    },
    function(error, response, body) {
      //transform the response from the external API. The response must be JSON.
      //no data type translation necessary because the external API sends back JSON
      res.status((error && error.status) || response.statusCode);
      if(error == null) {
        body = sanitizeResponse(body);
        //remove unnecessary fields
        delete body.foo;
        res.send(body);
      } else {
        console.log(error);
      }
    }
  );
};

/*
 * POST http://baas.kinvey.com/appdata/{kid_id}/customers
 * POST http://{DLC_url}/customers
 * Receives a JSON body of the object to create and sends back success 200 (TODO: check this)
 */
function create(req, res, next) {
  //TODO: Move this to the REST and SOAP servers
  //req.body.createTime = moment.now();
  //req.body.lastModifiedTime = moment.now();
  request(
    {
      method: 'POST',
      uri: apiServerUrl,
      //translate the JSON body into a format the external data can save
      json: req.body
    },
    function(error, response, body) {
      res.status((error && error.status) || response.statusCode);
      if(error == null) {
          body = sanitizeResponse(body);
          res.send(body);
      } else {
          console.log(error);
      }
    }
  );
};

/*
 * GET http://baas.kinvey.com/appdata/{kid_id}/customers/:id
 * GET http://{DLC_url}/customers/:id
 * Receives an id parameter and sends back a single post object
 */
function show(req, res, next) {
  request(
    {
      method: 'GET',
      uri: apiServerUrl + '/' + req.params.id
    },
    function(error, response, body) {
      res.status((error && error.status) || response.statusCode);
      if(error == null) {
          res.send(body);
      } else {
          console.log(error);
      }
    }
  );
};

/*
 * PUT http://baas.kinvey.com/appdata/{kid_id}/customers/:id
 * PUT http://{DLC_url}/customers/:id
 * Receives an id parameter and sends back ? //TODO: check this
 */
function update(req, res, next) {
  //req.body.lastModifiedTime = moment.now();
  request(
    {
      method: 'PUT',
      uri: apiServerUrl + '/' +req.params.id,
      //translate the JSON body into a format the external data can update
      json: req.body
    },
    function(error, response, body) {
      res.status((error && error.status) || response.statusCode);
      if(error == null) {
          res.send(body);
      } else {
          console.log(error);
      }
    }
  );
};

/*
 * DELETE http://baas.kinvey.com/appdata/{kid_id}/customers/:id
 * DELETE http://{DLC_url}/customers/:id
 * Receives an id parameter and sends back ? //TODO: check this
 */
function destroy(req, res, next) {
	request(
    {
      method: 'DELETE',
      uri: apiServerUrl + '/' + req.params.id
    },
    function(error, response, body) {
      res.status((error && error.status) || response.statusCode);
      if(error == null) {
          res.send(body);
      } else {
          console.log(error);
      }
    }
  );
};

function sanitizeResponse(body) {
  //ensure the response matches the Kinvey requires fields: _id and _kmd(TODO: check this)
  body._id = body.id;
  delete body.id;
  body._acl = {}
  return body;
}

module.exports = router;
