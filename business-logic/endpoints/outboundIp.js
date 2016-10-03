function onRequest(request, response, modules) {
  modules.request.get({uri:'http://jsonip.com'}, function(err, res, body){
    response.body = { "outboundIP": JSON.parse(body).ip };
    response.complete(200);
  });
}