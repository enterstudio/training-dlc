function onRequest(request, response, modules) {
  var Promise = modules.bluebird;
  var logger = modules.logger;
  
  function promiseFactory(i, j) {
    return Promise.resolve(i*j);
  }
   
  var promiseFactories = [];
  for(var i=1; i<=12; i++)
     for(var j=1; j<=12; j++)
       promiseFactories.push(promiseFactory(i, j));
                  
	var result = Promise.resolve();
  Promise.all(promiseFactories).then(function(values) {
    return values.reduce(function(prev, curr) {
      return prev + curr;
    });
  }).then(function(sum) {
    response.body = {"total": + sum};
    response.complete(200);
  });
}