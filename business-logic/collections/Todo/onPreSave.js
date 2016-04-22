function onPreSave(request, response, modules) {
    var collectionAccess = modules.collectionAccess,
        logger = modules.logger;
    
    var requestBody = request.body;

    mergeRequestBody(requestBody, function (err) {
        if (err) {
            return response.error(err);
        } else {
            return response.continue();
        }
    });

    function mergeRequestBody(requestBody, callback) {
        if (!requestBody._id) {
            return callback()
        } else {
            collectionAccess.collection("Todo").findOne({"_id": collectionAccess.objectID(requestBody._id)}, function (err, todo) {
                if (err) {
                    return callback(err);
                }
                if (!todo) {
                    return callback();
                } else {
                    if (requestBody.action != todo.action) {
                        request.body.action = requestBody.action;
                    }

                    if (requestBody.competed !== todo.completed) {
                        request.body.completed = requestBody.completed
                    }

                    if (requestBody.duedate !== todo.duedate) {
                        request.body.duedate = requestBody.duedate
                    }

                    return callback()
                }
            });
        }
    }
}