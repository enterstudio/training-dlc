function onPostSave(request, response, modules) {
  var logger = modules.logger;
  var requestContext = modules.requestContext;
  var collectionAccess = modules.collectionAccess;
	var push = modules.push;
	
	logger.info("request body: " + JSON.stringify(request.body));
	if(request.body.completed == 1) {
	  var userId = requestContext.getAuthenticatedUserId();
	  collectionAccess.collection('user').findOne({"_id": collectionAccess.objectID(userId)}, function(err, user) {
	    push.sendMessage(user, "Congratulations on completing your task: " + request.body.action, function(err, results) {
	      if(err) {
	        logger.error(err);
	      } else {
	        logger.info("sent push successfully");
	      }
	      response.continue();
	    });
	  });
	} else {
	  logger.info("Task was not completed, no notification sent");
	  response.continue();
	}
}