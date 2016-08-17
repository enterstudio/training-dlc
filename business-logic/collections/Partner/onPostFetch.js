function onPostFetch(request, response, modules) {
    var context = modules.requestContext,
        logger = modules.logger,
        async = modules.async;
    
    logger.info('version: ' + context.clientAppVersion.majorVersion() + ' ' + context.clientAppVersion.minorVersion());

    var eachFunction = context.clientAppVersion.majorVersion() >= 2 ? addEmailField : deleteEmailField;
    async.each(response.body, eachFunction, completeCallback);

    function addEmailField(partner, cb) {
        if (!partner.email) {
            partner.email = "";
        }
        return cb();
    }

    function deleteEmailField(partner, cb) {
        delete partner.email;
        return cb();
    }

    function completeCallback() {
        return response.complete(200);
    }
}