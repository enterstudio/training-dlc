function onPreSave(request, response, modules) {
  modules.logger.info(JSON.stringify("presave " + JSON.stringify(request.body)));
  // if(!request.body.password.match(/^[a-z0-9]+$/i)) {
  //   response.error("password did not match");
  // }
  response.continue(); 
}