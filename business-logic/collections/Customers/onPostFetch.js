function onPostFetch(request, response, modules) {
  modules.logger.info("props: " + JSON.stringify(modules.requestContext.getCustomRequestProperties()));
  modules.logger.info("post headers: " + JSON.stringify(request.headers));
	response.continue();
}