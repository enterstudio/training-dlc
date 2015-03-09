var express = require('express');
var request = require("request");

var router = express.Router();

var apiServerUrl = "http://localhost:3000/posts";

function list(req, res, next) {
	request(
		{
			method: 'GET',
			uri: apiServerUrl
		},
		function(error, response, body) {
			if(error == null) {
				res.send(body);
			} else {
				console.log(error);
			}
		}
    );
};

function create(req, res, next) {
	request(
        {
            method: 'POST',
            uri: apiServerUrl,
            json: req.body
        },
        function(error, response, body) {
            if(error == null) {
                res.send(body);
            } else {
                console.log(error);
            }
        }
    );
};

function show(req, res, next) {
	request(
        {
            method: 'GET',
            uri: apiServerUrl + '/' + req.params.id
        },
        function(error, response, body) {
            if(error == null) {
                res.send(body);
            } else {
                console.log(error);
            }
        }
    );
};

function update(req, res, next) {
    console.log(req.body)
	request(
        {
            method: 'PUT',
            uri: apiServerUrl + '/' +req.params.id,
            json: req.body
        },
        function(error, response, body) {
            if(error == null) {
                res.send(body);
            } else {
                console.log(error);
            }
        }
    );
};

function destroy(req, res, next) {
	request(
        {
            method: 'DELETE',
            uri: apiServerUrl + '/' + req.params.id
        },
        function(error, response, body) {
            if(error == null) {
                res.send(body);
            } else {
                console.log(error);
            }
        }
    );
};

router.route('/')
    .get(list)
    .post(create);

router.route('/:id')
    .get(show)
    .put(update)
    .delete(destroy);

module.exports = router;
