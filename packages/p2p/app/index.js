/* P2P peer discovery server */

const WSServer = require('rpc-websockets').Server

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

const server = new WSServer({ host, port })

console.log(`Peer discovery server listening on ws://${host}:${port}`)

const ROOMS = {}

server.register('joinRoom', ([room, id]) => {
  if (!ROOMS[room]) { ROOMS[room] = [] }
  if (ROOMS[room][id]) {
    console.log(`Error: ID '${id}' already in peer discovery channel '${room}'`)
    return
  }
  console.log(`Id ${id} joining room ${room}`)
  ROOMS[room].push(id)

  // Time out from the room after 1 minute
  setTimeout(() => {
    console.log(`ID ${id} timed out from room ${room}`)
    leaveRoom(room, id)
  }, 240000)
})

server.register('leaveRoom', ([room, id]) => {
  console.log(`ID ${id} leaving room ${room}`)
  leaveRoom(room, id)
})

server.register('rollCall', ([room]) => {
  if (ROOMS[room]) {
    return ROOMS[room]
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

function leaveRoom(room, id) {
  const index = ROOMS[room].indexOf(id)
  ROOMS[room].splice(index, 1)
}