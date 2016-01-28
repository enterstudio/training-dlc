var express = require("express");
var request = require("request");
var moment = require("moment");

var format = require('../utils/formatting');

var router = express.Router();
//Url for the external data source.
//TODO: replace with your external data source
var apiServerUrl = "http://localhost:3000/partner";

router.route('/_count')
    .get(count); // GET {dlc_url}/partner/_count

router.route('/')
    .get(list) // GET {dlc_url}/partner
    .post(create); // POST {dlc_url}/partner

router.route('/:id')
    .get(show) // GET {dlc_url}/partner/:id
    .put(update) // PUT {dlc_url}/partner/:id
    .delete(destroy);// DELETE {dlc_url}/partner/:id

/*
 * GET http://baas.kinvey.com/appdata/{kid_id}/partner
 * GET http://{dlc_url}/partner
 * Receives no parameters and send back an array of partner objects
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
      uri: format.outboundRequest(apiServerUrl, req)
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
 * POST http://baas.kinvey.com/appdata/{kid_id}/partner
 * POST http://{dlc_url}/partner
 * Receives a JSON body of the object to create and sends back success 200
 */
function create(req, res, next) {
  request(
    {
      method: 'POST',
      uri: format.outboundRequest(apiServerUrl, req),
      json: format.request(req.body)
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
 * GET http://baas.kinvey.com/appdata/{kid_id}/partner/:id
 * GET http://{dlc_url}/partner/:id
 * Receives an id parameter and sends back a single post object
 */
function show(req, res, next) {
  request(
    {
      method: 'GET',
      uri: format.outboundRequest(apiServerUrl, req)
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
 * PUT http://baas.kinvey.com/appdata/{kid_id}/partner/:id
 * PUT http://{dlc_url}/partner/:id
 * Receives an id parameter and sends back the updated JSON document
 * with
 */
function update(req, res, next) {
  req.body = format.request(req.body);
  body.last_modified_time = moment(); //TODO: is this needed?
  request(
    {
      method: 'PUT',
      uri: format.outboundRequest(apiServerUrl, req),
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
 * DELETE http://baas.kinvey.com/appdata/{kid_id}/partner/:id
 * DELETE http://{dlc_url}/partner/:partnerid
 * Receives an id parameter and sends back a count of deleted items
 */
function destroy(req, res, next) {
	request(
    {
      method: 'DELETE',
      uri: format.outboundRequest(apiServerUrl, req)
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
      uri: format.outboundRequest(apiServerUrl, req)
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

/*
 * Clean up the response body from your data source to match the format
 * expected by the Kinvey cloud and SDK.
 * _id ==> must be a string and is the primary key
 * _kmd ==> Created time and last modified time, timezone must match yyyy-mm-ddThh:mm:ss.msZ
 * _acl ==> used by Kinvey but can be empty
 */
function formatResponse(body) {
  body._id = body.id.toString();
  delete body.id;
  body._kmd = {"ect":body.created_time, "lmt":body.last_modified_time};
  delete body.created_time;
  delete body.last_modified_time;
  body._acl = {};
  body.partnername = body.name;
  delete body.name;
  body.partnercompany = body.company ? body.company.name : "";
  delete body.company;

  return body;
}

module.exports = router;
