const sdk = require('kinvey-backend-sdk');
const request = require("request");

const service = sdk.service(function(err, service) {
  const dataLink = service.dataLink;
  const timecards = dataLink.serviceObject('timecards');

  if(err != null) {
    console.log(JSON.stringify(err));
  }

  timecards.onGetById(show);

  function show(req, complete, modules) {
    const options = {
      useBl: false,
      useMasterSecret: false
    }
    console.dir(modules);
    const users = modules.dataStore().collection('user');
    
    console.dir(modules.requestContext);
    const currentUserName = modules.requestContext.getAuthenticatedUsername();
    const currentUserId = modules.requestContext.getAuthenticatedUserId();

    console.log("userid: " + currentUserId);

    users.findById(currentUserId, function(err, result) {
      var options = {
        method: 'GET',
        url: 'your url here',
        headers: {
          'User-Agent': 'request'
        }
      };
      //TODO: add appropriate security headers (x-kinvey, mmerrill)
      request(options, function(error, response, body) {
        res.status((error && error.status) || response.statusCode);
        if(error == null && res.statusCode == 200) {
          //on success convert to the correct format and respond
          body = JSON.parse(body);
          return complete(body).ok().next();
        } else {
          //on failure: log the error and ensure that a clean error message is returned
          console.log(error);
          return complete(error).runtimeError().next();
        }
      })
    });
  };
});