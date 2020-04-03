const WebSocket = require('rpc-websockets').Client

/*** STATE ***/

let server
let ourId
let theirId
let room
let events = {}
let survivingPeer
let offeringPeer
let answeringPeer
let dataChannel
let connectionStatusCB
let messageCB

/*** MAIN FUNCTIONS ***/

function connect(userId, uri) {
  // Set user ID
  ourId = userId

  resetState()

  // Connect to server
  server = new WebSocket(uri)

  // Set up offering peer
  offeringPeer = new RTCPeerConnection()

  // Set up offering peer's data channel
  dataChannel = offeringPeer.createDataChannel("dataChannel")

  // Set up answering peer
  answeringPeer = new RTCPeerConnection()

  // Allow answering peer to accept a data channel from an offer
  answeringPeer.ondatachannel = handleReceiveDataChannel
}

function resetState() {
  server = null
  theirId = null
  room = 'empty'
  survivingPeer = null
  offeringPeer = null
  answeringPeer = null
  dataChannel = null
  connectionStatusCB = null
}

function disconnect() {
  dataChannel.close()
  leaveRoom()
  server = null
  theirId = null
  events = {}
  messageCB = null
}

function listenConnectionStatus(callback) {
  connectionStatusCB = callback
  dataChannel.onopen = callback
  dataChannel.onclose = callback
}

function listenMessage(callback) {
  messageCB = callback
  dataChannel.onmessage = callback
}

function whenServerReady(callback) {
  server.on('open', callback)
}

function whenServerDisconnect(callback) {
  server.on('close', callback)
}

function eventName(type, key) {
  return `${type}-${key}`
}

function joinRoom(roomName) {
  room = roomName
  server.call('joinRoom', [room, ourId])
}

function leaveRoom() {
  server.call('leaveRoom', [room, ourId])
  room = 'empty'
}

async function rollCall() {
  const peers = await server.call('rollCall', [room])
  return peers.filter(id => id != ourId)
}

function listenOffers(callback) {
  subscribe('offer', callback)
  subscribe('answer', (e) => {
    acceptAnswer(e.from, e.data)
  })
  subscribe('candidate', (e) => {
    addCandidate(e.from, e.data)
  })
}

function subscribe(eventType, callback) {
  events[eventType] = eventName(eventType, ourId)
  server.call('addEvent', [events[eventType]])
  server.subscribe(events[eventType])
  server.on(events[eventType], async (e) => {
    callback(e)
  })
}

function unsubscribe(eventType) {
  server.unsubscribe(events[eventType])
}

async function sendOffer(id) {
  // leave the matchmaking system & start the connecting process
  answeringPeer = null
  leaveRoom()
  unsubscribe('offer')
  survivingPeer = offeringPeer
  theirId = id

  // send the offer
  const offer = await survivingPeer.createOffer()
  await survivingPeer.setLocalDescription(offer)
  server.call('triggerEvent', [eventName('offer', theirId), offer, ourId])
}

async function sendAnswer(id, offer) {
  // leave the matchmaking system & start the connecting process
  offeringPeer = null
  leaveRoom()
  unsubscribe('offer')
  unsubscribe('answer')
  survivingPeer = answeringPeer
  theirId = id

  // send the answer
  await survivingPeer.setRemoteDescription(new RTCSessionDescription(offer))
  const answer = await survivingPeer.createAnswer()
  await survivingPeer.setLocalDescription(answer)
  server.call('triggerEvent', [eventName('answer', theirId), answer, ourId])

  // be ready to start candidate exchange
  survivingPeer.onicecandidate = handleSendCandidate
}

async function acceptAnswer(id, answer) {
  // finish leaving matchmaking
  unsubscribe('answer')

  if (id != theirId) { throw new Error(`Answer ID ${id} does not match target id ${theirId}`)}
  await survivingPeer.setRemoteDescription(new RTCSessionDescription(answer))

  // be ready to start candidate exchange
  survivingPeer.onicecandidate = handleSendCandidate
}

function addCandidate(id, candidate) {
  if (id != theirId) { throw new Error(`Candidate ID ${id} does not match target id ${theirId}`)}
  console.log(`Adding candidate ${candidate} from ID ${id}`)
  survivingPeer.addIceCandidate(candidate).catch(e => { throw new Error(e) })
}

function sendMessage(msg) {
  dataChannel.send(msg)
}

/*** HANDLERS ***/

const handleReceiveDataChannel = (event) => {
  console.log('Received data channel')
  dataChannel = event.channel
  dataChannel.onopen = connectionStatusCB
  dataChannel.onclose = connectionStatusCB
  dataChannel.onmessage = messageCB
}

const handleSendCandidate = (event) => {
  if (event.candidate) {
    const candidate = event.candidate
    console.log(`Sending candidate ${candidate} to ID ${theirId}`)
    server.call('triggerEvent', [eventName('candidate', theirId), candidate, ourId])
  }
}

/*** EXPORTS ***/

module.exports = {
  connect,
  disconnect,
  listenConnectionStatus,
  listenMessage,
  whenServerReady,
  whenServerDisconnect,
  joinRoom,
  rollCall,
  listenOffers,
  sendOffer,
  sendAnswer,
  acceptAnswer,
  addCandidate,
  sendMessage
}
