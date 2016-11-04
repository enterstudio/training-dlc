const sdk = require('kinvey-flex-sdk');
const request = require("request");

const service = sdk.service(function(err, flex) {
  const data = flex.data;
  const timecards = data.serviceObject('timecards');

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
    const users = modules.dataStore(options).collection('user');
    
    const currentUserName = modules.requestContext.getAuthenticatedUsername();
    const currentUserId = modules.requestContext.getAuthenticatedUserId();

    console.log("username: " + currentUserName);
    console.log("userid: " + currentUserId);

    console.dir(users.findById);
    users.findById(currentUserId, (err, result) => {
      console.dir(result);
      var options = {
        method: 'GET',
        url: 'your url here',
        headers: {
          'User-Agent': 'request'
        }
      };
      //TODO: add appropriate security headers (x-kinvey, mmerrill)
      request(options, function(error, response, body) {
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