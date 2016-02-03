function onPreFetch(request, response, modules) {
	var context = modules.requestContext;
	modules.logger.info(request);
	//modules.logger.info('major.version: ' + context.clientAppVersion.majorVersion());
	//modules.logger.info('minor.version: ' + context.clientAppVersion.minorVersion());
	modules.logger.info('version: ' + context.clientAppVersion.majorVersion() + ' ' + context.clientAppVersion.minorVersion());
	
		//request.params.query = '{"AccountId":"0016100000JUjlPAAT"}';
		request.params.query = '{"AccountId":"0016100000JUjlPAAT"}';
  response.continue();
  
	
	
}