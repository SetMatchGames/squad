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

server.register('sendOffer', ([offer, id, room, answerEvent]) => {
  if (!ROOMS[room]) { ROOMS[room] = {} }
  if (ROOMS[room][id]) {
    console.log(`Error: ID '${id}' already in peer discovery channel '${room}'`)
    return
  }
  ROOMS[room][id] = offer
  addEvent(answerEvent)
})

server.register('getOffers', ([id, room]) => {
  let copy = Object.assign({}, ROOMS[room])
  delete copy[id]
  return copy
})

server.register('triggerAnswerEvent', ([answer, event]) => {
  // addEvent(event)
  console.log('sending answer', event)
  server.emit(`${event}`, { answer })
})

server.register('triggerCandidateEvent', ([candidate, event]) => {
  addEvent(event)
  console.log('sending candidate', event)
  server.emit(`${event}`, { candidate })
})

server.register('addEvent', () => {
  addEvent('answer-cfc5f600d6e337b86b9702cd4a80f399')
})

server.register('triggerEvent', () => {
  server.emit('answer-cfc5f600d6e337b86b9702cd4a80f399')
})

server.register('eventList', () => {
  return server.eventList()
})

function addEvent(event) {
  if (!server.eventList().includes(event)) {
    server.event(`${event}`)
    console.log('added event', event)
  }
}

/*

const CHANNELS = {}

server.register('joinChannel', ([channel, id, offer, userName]) => {
  if (!server.eventList().includes(`join-${channel}`)) {
    server.event(`join-${channel}`)
  }
  console.log(`Added new server event join-${channel} to event list: ${server.eventList()}`)

  console.log(`${id} joining channel ${channel}`)
  if (!CHANNELS[channel]) { CHANNELS[channel] = {} }
  if (CHANNELS[channel][id]) { 
    console.log(`Error: ID '${id}' already in peer discovery channel '${channel}'`)
    return
  }
  CHANNELS[channel][id] = { offer, userName, answers: {} }
  console.log(`emitting join-${channel} event`)
  server.emit(`join-${channel}`)
  console.log(CHANNELS[channel][id])
  return CHANNELS[channel]
})

server.register('listPeers', ([channel, id]) => {
  console.log(`listing peers of ${id} in channel ${channel}`)
  if (!CHANNELS[channel]) { 
    console.log(`Error: channel '${channel}' does not exist`) 
    return
  }
  let copy = Object.assign({}, CHANNELS[channel])
  delete copy[id]
  return copy
})

server.register('leaveChannel', ([channel, id]) => {
  console.log(`${id} leaving channel ${channel}`)
  if (!CHANNELS[channel]) { 
    console.log(`Error: channel '${channel}' does not exist`)
    return 
  }
  if (!CHANNELS[channel][id]) { 
    console.log(`Error: ID '${id}' does not exist in channel '${channel}'`) 
    return
  }
  delete CHANNELS[channel][id]
  if (Object.keys(CHANNELS[channel]).length === 0) { delete CHANNELS[channel] }
})

server.register('sendAnswer', ([channel, targetId, sourceId, answer, userName]) => {
  console.log(`${sourceId} sending answer event to ${targetId}`)
  const event = `answer-${channel}`
  if (!server.eventList().includes(event)) {
    server.event(event)
  }
  console.log(`server events: ${server.eventList()}`)
  server.emit(event, { answer, userName, sourceId, targetId })
  console.log(`emitting ${event} to ${targetId}: ${answer}`)
})

server.register('sendCandidate', ([channel, targetId, sourceId, candidate, userName]) => {
  console.log(`${sourceId} sending candidate event to ${targetId}`)
  const event = `candidate-${channel}`
  if (!server.eventList().includes(event)) {
    server.event(event)
  }
  console.log(`server events: ${server.eventList()}`)
  server.emit(event, { candidate, userName, sourceId, targetId })
  console.log(`emitting ${event} to ${targetId}: ${candidate}`)
})

*/