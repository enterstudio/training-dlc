# training-dlc

A sample DLC connecting from Kinvey to a custom data source.

DLC runs on port 3001

In this case the custom data source is json-server which hosts a json format db on port 3000.

REST endpoints for a customers collection are provided
* GET /customers
* POST /customers
* GET /customers/:id
* PUT /customers/:id
* DELETE /customers/:id

The goal of this training is to demonstrate how to convert Kinvey requests into an external source and vice versa.
