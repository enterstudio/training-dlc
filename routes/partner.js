var express = require("express");
var request = require("request");

var format = require('../lib/formatting');

var router = express.Router();
//Url for the external data source.
//In a full custom DLC replace with your custom data source
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
  //Convert the query to a format that the custom data source expects
  req.query = formatPartnerQuery(req.query);
  format.parseQuery(req);
 /*
  * Create an external API request that matches your custom data source's
  * format. No translation of data request format necessary because the
  * external API in this case is REST.
  */
  request(
    {
      method: 'GET',
      uri: format.outboundRequest(apiServerUrl, req)
    },
    function(error, response, body) {
      //set the DLC response status code to the custom data source
      res.status((error && error.status) || response.statusCode);
      if(error == null && res.statusCode == 200) {
        //on success convert to the correct format and respond
        body = JSON.parse(body);
        body.forEach(function(partner) {
          partner = formatResponse(partner);
        });
        res.send(body);
      } else {
        //on failure: log the error and ensure that a clean error message is returned
        console.log(error);
        res.send(body);
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
  req.body = format.request(req.body);
  request(
    {
      method: 'POST',
      uri: format.outboundRequest(apiServerUrl, req),
      json: formatPartnerRequest(req.body)
    },
    function(error, response, body) {
      res.status((error && error.status) || response.statusCode);
      if(error == null && res.statusCode == 201) {
          res.send(formatResponse(body));
      } else {
          console.log(error);
          res.send(body);
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
      if(error == null && res.statusCode == 200) {
        body = JSON.parse(body);
        res.send(formatResponse(body));
      } else {
        console.log(error);
        res.send(body);
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
  request(
    {
      method: 'PUT',
      uri: format.outboundRequest(apiServerUrl, req),
      //translate the JSON body into a format the external data can update
      json: formatPartnerRequest(req.body)
    },
    function(error, response, body) {
      res.status((error && error.status) || response.statusCode);
      if(error == null && res.statusCode == 200) {
          res.send(body);
      } else {
          console.log(error);
          res.send(body);
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
      if(error == null && res.statusCode == 200) {
        //body contains a count of the number of records deleted
        body = {"count":1};
        // DELETE response should be a 200 so the request body is visible
        res.status(200).send(body);
      } else {
        console.log(error);
        res.send(body);
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
      if(error == null && res.statusCode == 200) {
          //TODO: LAB: Response format is {"count":150}
          body = JSON.parse(body);
          body = {"count": body.length};
          res.send(body);
      } else {
          console.log(error);
          res.send(body);
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
 *
 * The response must be JSON. In this case the response was already JSON.
 * Fields names must be converted to match Kinvey standards.
 */
function formatResponse(body) {
  //TODO: LAB: send back the correct id format to Kinvey
  body._id = body.id.toString();
  delete body.id;
  //TODO: LAB: send back the correct time format to Kinvey
  body._kmd = {"ect":body.created_time, "lmt":body.last_modified_time};
  delete body.created_time;
  delete body.last_modified_time;
  //TODO: LAB: send back the correct acl format to Kinvey
  body._acl = {};
  //Field names are updated to match the expected format of the mobile app
  body.partnername = body.name;
  delete body.name;
  body.partnercompany = body.company ? body.company.name : "";
  delete body.company;

  return body;
}

function formatPartnerRequest(body) {
    body.company = body.company ? body.company : {};
    body.company.name = body.company.name ? body.company.name : body.partnercompany;
    delete body.partnercompany;

    body.name = body.name ? body.name : body.partnername;
    delete body.partnername;

    return body;
}

function formatPartnerQuery(query){
    if(query.query == null) {
        return;
    }

    var parsedQuery = JSON.parse(query.query);
    if(parsedQuery["partnername"]){
        parsedQuery["name"] = parsedQuery["partnername"];
        delete parsedQuery["partnername"];
    }

    if(parsedQuery["partnercompany"]) {
        parsedQuery["company.name"] = parsedQuery["partnercompany"];
        delete parsedQuery["partnercompany"];
    }

    query.query = JSON.stringify(parsedQuery);
    return query;
}

module.exports = router;
