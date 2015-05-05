var express = require("express");
var request = require("request");
var moment = require("moment");

var router = express.Router();
//Url for the external data source.
//TODO: replace with your external data source
var apiServerUrl = "http://localhost:3000/posts";

router.route('/')
    .get(list) // GET {dlc_url}/posts
    .post(create); // POST {dlc_url}/posts

router.route('/:id')
    .get(show) // GET {dlc_url}/posts/:id
    .put(update) // PUT {dlc_url}/posts/:id
    .delete(destroy);// DELETE {dlc_url}/posts/:id

/*
 * GET http://baas.kinvey.com/appdata/{kid_id}/posts
 * GET http://{DLC_url}/posts
 * Receives no parameters and send back an array of posts objects
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
        //ensure the response matches the Kinvey requires fields: _id and _kmd(TODO: check this)
        body._id = body.id;
        body._acl = {}
        delete body.id;
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
 * POST http://baas.kinvey.com/appdata/{kid_id}/posts
 * POST http://{DLC_url}/posts
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
          res.send(body);
      } else {
          console.log(error);
      }
    }
  );
};

/*
 * GET http://baas.kinvey.com/appdata/{kid_id}/posts/:id
 * GET http://{DLC_url}/posts/:id
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
 * PUT http://baas.kinvey.com/appdata/{kid_id}/posts/:id
 * PUT http://{DLC_url}/posts/:id
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
 * DELETE http://baas.kinvey.com/appdata/{kid_id}/posts/:id
 * DELETE http://{DLC_url}/posts/:id
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

module.exports = router;
