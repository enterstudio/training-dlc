function onPreDelete(request, response, modules) {
  modules.logger.info(JSON.stringify("predelete"));
	response.continue();
}