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
    if(req.params.id) {
      outboundRequest += '/' + req.params.id;
    }
    if (req.parameters) {
      outboundRequest += req.parameters;
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
    if(req.query.query == null) {
      return;
    }

    var queryString = "";
    var query = JSON.parse(req.query.query);

    for(var key in query){
      var append = (req.parameters != null && req.parameters.length > 0) ? "&" : "?";
      req.parameters += append + key+ "=" + query[key];
    };
  }
};

module.exports = formatting;