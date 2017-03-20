function onPreFetch(request, response, modules) {
  modules.logger.info(JSON.stringify("prefetch"));
  response.continue();
}