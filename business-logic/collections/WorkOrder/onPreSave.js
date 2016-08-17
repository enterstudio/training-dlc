function onPreSave(request, response, modules) {
    var logger = modules.logger,
        moment = modules.moment;

    request.body.timestamp = moment();
    return response.continue();
}