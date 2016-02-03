// Standard lib.
var path = require('path');

// Package modules.
var tester = require('kinvey-business-logic-testing-library');

// Configure.
var options = {
  blRootPath    : path.join(__dirname, '../../../business-logic'),
  environmentID : 'kid_ZJb6V2mWTe'
};

// Test suite.
describe('pushme', function() {
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
    this.endpoint = 'pushme';
  });
  after('configure', function() {
    delete this.endpoint; // Cleanup.
  });

  // Teardown the client.
  after('client', function(cb) {
    delete this.client; // Cleanup.
    tester.util.teardown(options, cb);
  });

  // Tests.
  it('should run.', function(done) {
    // Configure the request.
    var requestObject = {
      // Request details here.
    };

    // Run the endpoint.
    this.client.runCustomEndpoint(this.endpoint, requestObject, { }, function(err, blResult) {

      //
      // Assertions here.
      //

      done(err); // Continue.
    });
  });
});