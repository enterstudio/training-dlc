var jsonServer = require('json-server')

var object = {
  posts: [
    { id: 1, body: 'foo' }
  ]
}

var router = jsonServer.router('db.json') // Express router
var server = jsonServer.create()       // Express server

server.use(router)
server.listen(3000)