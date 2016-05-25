function onPostSave(request, response, modules) {
    var logger = modules.logger,
        requestContext = modules.requestContext,
        collectionAccess = modules.collectionAccess,
        push = modules.push,
        async = modules.async;

    var employeeId = request.body.employee_id;

    async.waterfall([async.apply(getEmployee,employeeId), updateEmployeeWorkOrderCount, sendPush],function(err){
        if (err) {
            return response.error(err);
        } else {
            return response.continue();
        }
    });

    function getEmployee(id, cb) {
        if (!id) {
            return cb();
        } else {
            collectionAccess.collection("Employees").find({"_id": collectionAccess.objectID(id)}, function (err, employees) {
                var employee = employees[0];
                return cb(err, employee);
            });
        }
    }

    function updateEmployeeWorkOrderCount(employee, callback){
        if (!employee) {
            return callback();
        } else {
            var workOrderCount = employee.workOrderCount;

            workOrderCount = workOrderCount ? workOrderCount + 1: 1;

            var newFields = {
                workOrderCount: workOrderCount
            };
            collectionAccess.collection("Employees").update({"_id": collectionAccess.objectID(employeeId)}, {"$set": newFields}, {}, function (err, results) {
                return callback(err, workOrderCount);
            });
        }
    }

    function sendPush(workOrderCount, callback) {
        if (workOrderCount && workOrderCount % 10 == 0) {
            var userId = requestContext.getAuthenticatedUserId(),
                text = "Your order count value is " + workOrderCount + " now";
            sendPushNotification(userId, text, function (err) {
                return callback(err);
            });
        } else {
            return callback();
        }

        function sendPushNotification(userId, text, callback) {

            var saveNotificationInCollection = function (callback) {
                var notification = utils.kinveyEntity({
                    "text": text,
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
                    "notification_id": notification._id
                };

                var androidPayload = {
                    "message": text,
                    "from": "Training app",
                    "subject": text,
                    "notification_id": notification._id,
                    "user_id": userId
                };

                var pushPayload = push.sendPayload(user, iOSAps, iOSExtras, androidPayload);
                logger.info("Push Response: " + JSON.stringify(pushPayload));

                return callback();
            };

            async.waterfall([saveNotificationInCollection, getUnreadNotificationsCount, getUser, sendPayload], callback)
        }
    }

}