function onPreFetch(request, response, modules) {
  var context = modules.requestContext;
	modules.logger.info('version: ' + context.clientAppVersion.majorVersion() + ' ' + context.clientAppVersion.minorVersion());
	response.continue();
}