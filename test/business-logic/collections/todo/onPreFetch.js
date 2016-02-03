// Standard lib.
var path = require('path');

// Package modules.
var tester = require('kinvey-business-logic-testing-library');

// Configure.
var options = {
  blRootPath    : path.join(__dirname, '../../../../business-logic'),
  environmentID : 'kid_ZJb6V2mWTe'
};

// Test suite.
describe('todo: onPreFetch', function() {
  // Set-up the client.
  before('client', function(cb) {
    this.timeout(0); // Disable timeout.
    var self = this;
    tester.util.setup(options, function(err, client) {
      self.client = client; // Save.
      cb(err); // Continue.
    });
  });

  // Set the endpoint under test.
  before('configure', function() {
    this.collection = 'todo';
    this.hook = 'onPreFetch';
  });

  // Populate the datastore.
  before('populate', function(cb) {
    var data = [
      // JSON objects here.
    ];
    this.client.dataStore.importCollectionData(this.collection, data, true, cb)
  });
  after('populate', function(cb) {
    var query = {
      // MongoDB-style JSON query here.
    };
    this.client.dataStore.removeCollectionData(this.collection, query, cb);
  });

  // Teardown the client.
  after('client', function(cb) {
    delete this.client; // Cleanup.
    tester.util.teardown(options, cb);
  });

  // Cleanup.
  after('configure', function() {
    delete this.collection;
    delete this.hook;
  });

  // Tests.
  it('should run.', function(done) {
    // Configure the request.
    var requestObject = {
      // Request details here.
    };

    // Run the endpoint.
    this.client.runCollectionHook(this.collection, this.hook, requestObject, { }, function(err, blResult) {

      //
      // Assertions here.
      //

      done(err); // Continue.
    });
  });
});