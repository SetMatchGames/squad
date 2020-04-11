/* global require process setTimeout */

/* P2P peer discovery server */

const WSServer = require('rpc-websockets').Server
const http = require('http')

const host = conf('PEER_DISCOVERY_HOST', 'localhost')
const port = conf('PORT', '8889')

const server = http.createServer((req, res) => {
  console.log('health check server OK')
  res.end()
})
server.on('clientError', (err, socket) => {
  console.log('health check server ERROR', err)
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})
server.listen(port)
console.log(`health check server listening on http://${host}:${port}`)

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

const roomTimeout = conf('ROOM_TIMEOUT', 240000)

const wsServer = new WSServer({ server })

console.log(`Peer discovery server listening on ws://${host}:${port}`)

const rooms = {}

wsServer.register('joinRoom', ([room, id]) => {
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

wsServer.register('leaveRoom', ([room, id]) => {
  console.log(`ID ${id} leaving room ${room}`)
  leaveRoom(room, id)
})

wsServer.register('rollCall', ([room]) => {
  if (rooms[room]) {
    return rooms[room]
  }
  return []
})

wsServer.register('addEvent', ([event]) => {
  if (!wsServer.eventList().includes(event)) {
    wsServer.event(`${event}`)
    console.log('Added event', event)
  }
})

wsServer.register('triggerEvent', ([event, data, from]) => {
  console.log(`Triggering ${event} event`)
  wsServer.emit(event, { data, from })
})

function leaveRoom (room, id) {
  const index = rooms[room].indexOf(id)
  rooms[room].splice(index, 1)
}
