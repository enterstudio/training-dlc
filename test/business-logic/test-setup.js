// Standard lib.
var path = require('path');

// Package modules.
var tester = require('kinvey-business-logic-testing-library');

// Configure.
var options = {
  blRootPath    : path.join(__dirname, '../../business-logic'),
  environmentID : 'kid_Wy7NMiwaTx'
};

// Set-up the client.
before('client', function(cb) {
  this.timeout(0); // Disable timeout.
  var self = this;
  tester.util.setup(options, function(err, client) {
    self.client = client; // Save.
    cb(err); // Continue.
  });
});

// Clean-up logger, e-mail, and push entities.
[ '_blLogs', '_outgoingEmailMessages', '_outgoingPushMessages' ].forEach(function(collection) {
  afterEach('cleanup:' + collection, function(cb) {
    this.client.dataStore.removeCollectionData(collection, { }, cb);
  });
});

// Teardown the client.
after('client', function(cb) {
  delete this.client; // Cleanup.
  tester.util.teardown(options, cb);
});