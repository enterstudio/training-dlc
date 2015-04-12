/*
* Health check used to ensure the service is running
*/

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send("ok");
});

module.exports = router;