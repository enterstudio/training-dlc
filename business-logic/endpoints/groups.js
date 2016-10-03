// Groups Endpoint
// This secure endpoint allows the Kinvey Groups app to query all user groups.
// It should be named 'groups'.
//
// Help:
// http://devcenter.kinvey.com/html5/guides/business-logic#custom-endpoints

function onRequest(request, response, modules) {
    var groups = modules.collectionAccess.collection('group');
    var securityContext = modules.backendContext.getSecurityContext();

    // Enforce master security context
    if (securityContext !== 'master') return response.error("You must use master credentials.");

    groups.find({}, function(error, docs) {
        if (error) return response.error(error);

        response.body = docs;
        response.complete(200);
    });
}