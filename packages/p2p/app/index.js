/* global require process setTimeout */

/* P2P peer discovery server */

const WSServer = require('rpc-websockets').Server
const http = require('http')

const healthCheckServer = http.createServer((req, res) => {
  console.log('health check server OK')
  res.end()
})
healthCheckServer.on('clientError', (err, socket) => {
  console.log('health check server ERROR', err)
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})
healthCheckServer.listen("0.0.0.0:80")
console.log(`health check server listening on port ${process.env.PORT}`)


function conf (name, defaultValue) {
  var value = process.env[name]
  if (value === undefined) {
    value = defaultValue
  }
  if (value === undefined) {
    throw new Error(`Required configuration "${name}" not found.`)
  }
  return value
}

const host = conf('PEER_DISCOVERY_HOST', 'localhost')
const port = conf('PEER_DISCOVERY_PORT', '8889')
const roomTimeout = conf('ROOM_TIMEOUT', 240000)

const server = new WSServer({ host, port })

console.log(`Peer discovery server listening on ws://${host}:${port}`)

const rooms = {}

server.register('joinRoom', ([room, id]) => {
  if (!rooms[room]) { rooms[room] = [] }
  if (rooms[room][id]) {
    console.log(`Error: ID '${id}' already in peer discovery channel '${room}'`)
    return
  }
  console.log(`Id ${id} joining room ${room}`)
  rooms[room].push(id)

  // Time out from the room after 1 minute
  setTimeout(() => {
    console.log(`ID ${id} timed out from room ${room}`)
    leaveRoom(room, id)
  }, roomTimeout)
})

server.register('leaveRoom', ([room, id]) => {
  console.log(`ID ${id} leaving room ${room}`)
  leaveRoom(room, id)
})

server.register('rollCall', ([room]) => {
  if (rooms[room]) {
    return rooms[room]
  }
  return []
})

server.register('addEvent', ([event]) => {
  if (!server.eventList().includes(event)) {
    server.event(`${event}`)
    console.log('Added event', event)
  }
})

server.register('triggerEvent', ([event, data, from]) => {
  console.log(`Triggering ${event} event`)
  server.emit(event, { data, from })
})

function leaveRoom (room, id) {
  const index = rooms[room].indexOf(id)
  rooms[room].splice(index, 1)
}
