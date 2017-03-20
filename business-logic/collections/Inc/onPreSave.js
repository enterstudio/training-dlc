function onPreSave(request, response, modules) {
  var logger = modules.logger;
  var ca = modules.collectionAccess;
  var inc = ca.collection("Inc");
  
  var id = ca.objectID(request.entityId);
  inc.updateAsync({"_id": id}, {$inc:{"version": 1}}).then(function(result) {
    logger.info("increment result: " + JSON.stringify(result));
    return inc.findOneAsync({"_id": id});
  }, function(error) {
    logger.info("increment error: " + JSON.stringify(error));
  }).then(function(result) {
    logger.info("find result: " + JSON.stringify(result));
    request.body.version = result.version;
    response.continue();
  }, function(error) {
    logger.info("find error: " + JSON.stringify(error));
  }).catch(function(ex) {
    logger.error(JSON.stringify(ex));
    response.error(ex);
  });
  
}