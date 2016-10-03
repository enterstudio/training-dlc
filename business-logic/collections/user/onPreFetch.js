function onPreFetch(request, response, modules) {
  var collectionAccess = modules.collectionAccess;
  collectionAccess.collection("user").find({  "_id": collectionAccess.objectID("5786ae4767a60a27072673e5")}, function (err, results) {
    var user = results[0];

    modules.logger.info(JSON.stringify(user._socialIdentity));
    response.continue();
  });
}