var request = require("request");
var format = require('./formatting');

var conflictResolver = {
  resolvePartnerCompanyNameConflict: function (body, id, apiServerUrl, cb) {
    getPartnerById(id, function (partner) {
      if (partner.company && partner.company.name) {
        body.company = partner.company;
      }
      return cb(body);
    });

    function getPartnerById(id, cb) {
      var req = {
        "params": {
          "id": id
        }
      };
      request(
        {
          method: 'GET',
          uri: format.outboundRequest(apiServerUrl, req)
        },
        function (error, response, body) {
          return cb(JSON.parse(body));
        }
      );
    }
  }
};

module.exports = conflictResolver;