var moment = require("moment");

var formatting = {
  /*
   * Turn the request into a format that the data source expects.
   * _id ==> primary key
   * _kmd ==> created and last modified field
   * _acl ==> discarded
   */
  request: function(body) {
    body.id = body._id;
    delete body._id;
    //Fill in the required fields if missing (on create)
    if(body._kmd === undefined) {
      body.created_time = moment();
      body.last_modified_time = moment();
    } else {
      body.created_time = body._kmd.ect;
      body.last_modified_time = body._kmd.lmt;
    }
    delete body._kmd;
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
    if(req.params.id) {
      outboundRequest += '/' + req.params.id;
    }
    if (req.parameters) {
      outboundRequest += req.parameters;
    }
    console.log("Outbound Request:", outboundRequest);
    return outboundRequest;
  }
};

module.exports = formatting;