var moment = require("moment");

var formatting = {
  /*
   * Turn the request into a format that the data source expects.
   * _id ==> primary key
   * _kmd ==> created and last modified field
   * _acl ==> discarded
   */
  request: function(body) {
    //TODO: LAB: convert the Kinvey id into the data source id
    body.id = body._id;
    delete body._id;
    //Fill in the required fields if missing (on create)
    //TODO: LAB: convert the Kinvey _kmd into the data source time stamps
    if(body._kmd === undefined) {
      body.created_time = moment();
      body.last_modified_time = moment();
    } else {
      body.created_time = body._kmd.ect;
      body.last_modified_time = body._kmd.lmt;
    }
    delete body._kmd;
    //TODO: LAB: remove the Kinvey _acl
    delete body._acl;
    return body;
  },

  /*
   * For this collection add the right parameters and filters onto the
   * outbound request.
   */
  outboundRequest: function(apiServerUrl, req) {
    var outboundRequest = apiServerUrl;
    // Kinvey sends ids in the REST style and the datasource receives them the same way
    //TODO: LAB: add the id to the outbound REST call
    if(req.entityId) {
      outboundRequest += '/' + req.entityId;
    }
    if (req.query) {
      outboundRequest += req.query;
    }
    console.log("Outbound Request:", outboundRequest);
    return outboundRequest;
  },

  /*
   * Parse the incoming Mongo query and convert it to a query that the
   * REST api understands.
   * For example: /partner?query={"username":"Bret"}
   */
  parseQuery: function(req) {
    if(req.query == null || req.query.query == null) {
      return;
    }

    var query = JSON.parse(req.query);

    for(var key in query) {
      var append = (req.parameters != null && req.parameters.length > 0) ? "&" : "?";
      if (query[key].hasOwnProperty("$regex")) {
        //added for supporting queries with regular expressions
        //For example:/partner/?query={"partnername":{"$regex":"^L"}}
        req.parameters += append + key + "_like=" + query[key]["$regex"];
      } else {
        req.parameters += append + key + "=" + query[key];
      }
    }
  }
};

module.exports = formatting;