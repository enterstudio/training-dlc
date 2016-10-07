var moment = require("moment");

var formatting = {
  /*
   * Turn the request into a format that the data source expects.
   * _id ==> primary key
   * _kmd ==> created and last modified field
   * _acl ==> discarded
   */
  request: function(body) {
    console.log(body);

    //TODO: LAB: convert the Kinvey id into the data source id
    if (body._id){
      body.id = body._id;
      delete body._id;
    } 
    //Fill in the required fields if missing (on create)
    //TODO: LAB: convert the Kinvey _kmd into the data source time stamps
    if (body._kmd && body._kmd.ect) {
      body.created_time = body._kmd.ect;
    } else {
      body.created_time = moment();
    }
    if (body._kmd && body._kmd.lmt) {
      body.last_modified_time = body._kmd.lmt;
    } else {
      body.last_modified_time = moment();
    }
    delete body._kmd;

    //TODO: LAB: remove the Kinvey _acl
    delete body._acl;

    console.log(body);
    return body;
  },

  /*
   * For this collection add the right parameters and filters onto the
   * outbound request.
   */
  outboundRequest: function(apiServerUrl, req) {
    // Kinvey sends ids in the REST style and the datasource receives them the same way
    //TODO: LAB: add the id to the outbound REST call
    if (req.params.id) {
      apiServerUrl += "/" + req.params.id;
    }
    //TODO: LAB: add all other parameters to the outbound request
    apiServerUrl += req.parameters;
    return apiServerUrl;
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
      //TODO: LAB: support regex querying
    }
  }
};

module.exports = formatting;