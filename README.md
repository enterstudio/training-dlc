# training-dlc

A sample DLC connecting from Kinvey to a custom data source.

### Getting started
* git clone git@github.com:KinveyClientServices/training-dlc.git
* git checkout release/{your_team_name}
* npm install
* npm start
* ngrok http 4000
* Create a DLC configuration in the Kinvey Console for the forwarding url (https://console.kinvey.com)

DLC runs on port 3001

In this case the custom data source is json-server which hosts a json format db on port 3000.

REST endpoints for a customers collection are provided
* GET /customers
* POST /customers
* GET /customers/:id
* PUT /customers/:id
* DELETE /customers/:id

The goal of this training is to demonstrate how to convert Kinvey requests into an external source and vice versa.

### Topics
* Where do the requests come from?
* What endpoints do I need?
* CRUD Operations
* What does the request structure look like?
* headers
* x-auth-key
  * x-kinvey-client-app-version
  * x-kinvey-custom-request-properties
  * x-kinvey-auth
* query params
  * mongo style queries
  * sort
  * limit
  * skip
* Outbound Datasource Request
* What does the response structure look like?
    * _id
    * _kmd.ect
    * _kmd.lmt
    * _acl
*_count
* What does the request structure look like?
* Outbound datasource request
* What does the response structure look like?
*health_check