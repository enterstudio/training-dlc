const moment = require("moment");
const async = require("async");
const request = require("request");

module.exports.getAndUpdateData = function getAndUpdateData() {
  auth = {
    user: 'austin',
    pass: '1234'
  };

  options = {
    url: 'http://baas.kinvey.com/appdata/kid_Wy7NMiwaTx/Todo',
    auth: auth
  }

  request.get(options, (err, response, workOrders) => {
    // if error, return an error
    if (err) {
      return console.log('Error: ' + err)
    }

    workOrders = JSON.parse(workOrders);

    async.each(workOrders, function(workOrder, callback) {
      workOrder.cronTime = moment();
      options = {
        url: 'http://baas.kinvey.com/appdata/kid_Wy7NMiwaTx/Todo/' + workOrder._id,
        auth: auth,
        json: workOrder
      }

      request.put(options, (err, response, body) => {
        if(err) {
          console.log('Error: ' + err)
          callback('Error: ' + err)
        } else {
          console.log("updated: " + JSON.stringify(response))
          callback()
        }
      })
    }, function(err) {
      if(err) {
        console.log('An update failed to process ' + moment());
      } else {
        console.log('All todos processed successfully ' + moment());
      }
      return;
    })
  });
}
