function onPreSave(request, response, modules) {

    request.body._acl = {
        "gr":true,
        "gw":false
    };

    return response.continue();
}