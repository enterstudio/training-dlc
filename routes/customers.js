var express = require("express");
var request = require("request");
var moment = require("moment");

var router = express.Router();
//Url for the external data source.
//TODO: replace with your external data source
var apiServerUrl = "http://localhost:3000/customers";

router.route('/_count')
    .get(count); // GET {dlc_url}/customers/_count

router.route('/')
    .get(list) // GET {dlc_url}/customers
    .post(create); // POST {dlc_url}/customers

router.route('/:id')
    .get(show) // GET {dlc_url}/customers/:id
    .put(update) // PUT {dlc_url}/customers/:id
    .delete(destroy);// DELETE {dlc_url}/customers/:id

/*
 * GET http://baas.kinvey.com/appdata/{kid_id}/customers
 * GET http://{dlc_url}/customers
 * Receives no parameters and send back an array of customers objects
 */
function list(req, res, next) {
 /*
  * Create an external API request that matches your data source's format.
  * no translation of data request format necessary because the external
  * API in this case is REST.
  */
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
        body = JSON.parse(body);
        body.forEach(function(customer) {
          customer = formatResponse(customer);
        });
        res.send(body);
      } else {
        console.log(error);
      }
    }
  );
};

/*
 * POST http://baas.kinvey.com/appdata/{kid_id}/customers
 * POST http://{dlc_url}/customers
 * Receives a JSON body of the object to create and sends back success 200 (TODO: check this)
 */
function create(req, res, next) {
  //TODO: Move this to the REST and SOAP servers
  req.body.created_time = moment();
  req.body.last_modified_time = moment();
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
          res.send(formatResponse(body));
      } else {
          console.log(error);
      }
    }
  );
};

/*
 * GET http://baas.kinvey.com/appdata/{kid_id}/customers/:id
 * GET http://{dlc_url}/customers/:id
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
        body = JSON.parse(body);
        res.send(formatResponse(body));
      } else {
        console.log(error);
      }
    }
  );
};

/*
 * PUT http://baas.kinvey.com/appdata/{kid_id}/customers/:id
 * PUT http://{dlc_url}/customers/:id
 * Receives an id parameter and sends back ? //TODO: check this
 */
function update(req, res, next) {
  req.body = formatRequest(req.body);
  body.last_modified_time = moment(); //TODO: is this needed?
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
 * DELETE http://{dlc_url}/customers/:id
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
        //body contains a count of the number of records deleted
        body = {"count":1};
        // DELETE response should be a 200 so the request body is visible
        res.status(200).send(body);
      } else {
        console.log(error);
      }
    }
  );
};

/*
 * Return the number of items that exist in this collection.
 * Used by the Kinvey console to display data that is available in the
 * collection.
 */
function count(req, res, next) {
  request(
    {
      method: 'GET',
      uri: apiServerUrl
    },
    function(error, response, body) {
      res.status((error && error.status) || response.statusCode);
      if(error == null) {
          // Response format is {"count":150}
          body = JSON.parse(body);
          body = {"count": body.length};
          res.send(body);
      } else {
          console.log(error);
      }
    }
  )
}

function formatRequest(body) {
  body.id = body._id;
  delete body._id;
  body.created_time = body._kmd.ect;
  body.last_modified_time = body._kmd.lmt;
  delete body._kmd;
  delete body._acl;
  return body;
}

/*
 * Clean up the response body from your data source to match the format
 * expected by the Kinvey cloud and SDK.
 */
function formatResponse(body) {
  //ensure the response matches the Kinvey required fields: _id and _kmd
  body._id = body.id;
  delete body.id;
  body._kmd = {"ect":body.created_time, "lmt":body.last_modified_time};
  delete body.created_time;
  delete body.last_modified_time;
  body._acl = {};
  //remove fields that are not relevant to the mobile app
  delete body.foo;
  return body;
}

module.exports = router;
