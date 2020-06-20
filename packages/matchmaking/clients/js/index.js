const WebSocket = require('rpc-websockets').Client

const state = {}

function connect (id, uri) {
  state.id = id
  state.server = new WebSocket(uri)
}

function disconnect () { /* TODO */ }

function whenReady (callback) {
  state.server.on('open', callback)
}

function joinRoom (roomName) {
  state.room = roomName
  state.server.call('joinRoom', [state.room, state.id])
}

function leaveRoom () {
  state.server.call('leaveRoom', [state.room, state.id])
  state.room = ''
}

async function rollCall () {
  const peers = await state.server.call('rollCall', [state.room])
  return peers.filter(id => id !== state.id)
}

function listenOffers (callback) {
  subscribe('offer', state.id, callback)
}

function eventName (stringArray) {
  let name = stringArray[0]
  for (let n = 1; n < stringArray.length; n++) {
    name += `_${stringArray[n]}`
  }
  return name
}

function subscribe (eventType, id, callback) {
  if (!state.events) { state.events = {} }
  state.events[eventType] = eventName([eventType, state.room, id])
  state.server.call('addEvent', [state.events[eventType]])
  state.server.subscribe(state.events[eventType])
  console.log('listening for events:', state.events[eventType])
  state.server.on(state.events[eventType], async (e) => {
    console.log('** received event of type:', state.events[eventType])
    callback(e)
  })
}

function unsubscribe (eventType) {
  state.server.unsubscribe(state.events[eventType])
}

function order (s1, s2) {
  if (s1 < s2) { return [s1, s2] }
  return [s2, s1]
}

function sendOffer (targetId, callback) {
  const orderedIds = order(state.id, targetId)
  // start the match
  subscribe('match', eventName(orderedIds), callback)
  // send the suggested match Id to another user
  console.log('trying to send offer:', state.events.match)
  state.server.call('triggerEvent', [eventName(['offer', state.room, targetId]), null, state.id])
  // leave the room
  leaveRoom()
}

function sendAnswer (targetId, callback) {
  const orderedIds = order(state.id, targetId)
  // start the match
  subscribe('match', eventName(orderedIds), callback)
  // send confirmation message
  sendMessage('match started')
  // leave the room
  leaveRoom()
}

function endMatch () {
  // unsub to the matchId
  unsubscribe(state.events.match)
}

function sendMessage (data) {
  // send match event with data and author id
  console.log('** match event name:', state.events.match)
  state.server.call('triggerEvent', [state.events.match, data, state.id])
}

/* EXPORTS */

module.exports = {
  connect,
  disconnect,
  whenReady,
  joinRoom,
  leaveRoom,
  rollCall,
  listenOffers,
  sendOffer,
  sendAnswer,
  endMatch,
  sendMessage
}
