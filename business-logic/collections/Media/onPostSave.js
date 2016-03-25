function onPostSave(request, response, modules) {
    var logger = modules.logger,
        async = modules.async,
        push = modules.push,
        collectionAccess = modules.collectionAccess,
        utils = modules.utils,
        backendContext = modules.backendContext;

    var userId = response.body._acl.creator,
        text = "Media entity with name '" + response.body.name + "' was created",
        mediaId = response.body._id;


    //don't send notification if media entity was created using master secret authentication
    if (backendContext.getAppKey() == backendContext.getAuthenticatedUsername()) {
        return response.complete(200);
    } else {
        sendPushNotification(userId, mediaId, text, function (err) {
            if (err) {
                return response.error(err);
            } else {
                return response.complete(200);
            }
        });
    }

    function sendPushNotification(userId, mediaId, text, callback) {

        var saveNotificationInCollection = function (callback) {
            var notification = utils.kinveyEntity({
                "text": text,
                "media_id": mediaId,
                "_acl": {"creator": userId},
                "read": false
            });

            collectionAccess.collection('Notification').insert(notification, function (err) {
                return callback(err, notification);
            });
        };

        var getUnreadNotificationsCount = function (notification, callback) {
            collectionAccess.collection('Notification').count({
                "user_id": userId,
                "read": false
            }, function (err, count) {
                return callback(err, count, notification);
            });
        };

        var getUser = function (count, notification, callback) {
            collectionAccess.collection('user').findOne({'_id': collectionAccess.objectID(userId)}, {}, function (err, user) {
                if (!user) {
                    return callback("User with id " + userId + " wasn't found");
                }
                return callback(err, count, notification, user);
            })
        };

        var sendPayload = function (count, notification, user, callback) {
            var iOSAps = {
                "alert": text,
                "badge": count,
                "sound": "notification.wav"
            };

            var iOSExtras = {
                "notification_id": notification._id,
                "media_id": mediaId
            };

            var androidPayload = {
                "message": text,
                "from": "Training app",
                "subject": text,
                "notification_id": notification._id,
                "user_id": userId,
                "media_id": mediaId
            };

            var pushPayload = push.sendPayload(user, iOSAps, iOSExtras, androidPayload);
            logger.info("Push Response: " + JSON.stringify(pushPayload));

            return callback();
        };

        async.waterfall([saveNotificationInCollection, getUnreadNotificationsCount, getUser, sendPayload], callback)
    }


}