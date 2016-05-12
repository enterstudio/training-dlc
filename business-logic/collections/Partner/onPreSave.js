function onPreSave(request, response, modules) {
    var logger = modules.logger,
        collectionAccess = modules.collectionAccess;

    var entityId = request.entityId;

    if (entityId && request.method == "PUT") {
        if (entityId.length == 24) {
            entityId = collectionAccess.objectID(entityId);
        }

        collectionAccess.collection("Partner").findOne({"id": entityId}, {}, function (err, partner) {
            if (err) {
                return response.error(err);
            } else if (!partner) {
                return response.continue();
            } else {
                request.body.partnercompany = partner.partnercompany ? partner.partnercompany : request.body.partnercompany;
                return response.continue();
            }
        });
    } else {
        return response.continue();
    }
}