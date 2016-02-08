var jsonServer = require('json-server')

var router = jsonServer.router('db.json') // Express router
var server = jsonServer.create()       // Express server

server.use(router)
server.listen(3000)