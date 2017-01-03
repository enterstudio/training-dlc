function onPreFetch(request, response, modules) {
  modules.requestContext.setCustomRequestProperty("internalUserId","test-user-id5");
  modules.logger.info("pre headers: " + JSON.stringify(request.headers));
	response.continue(); 
}