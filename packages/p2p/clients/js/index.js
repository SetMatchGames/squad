/* How to use this library to create a p2p data connection:
 * 
 * init(userId, uri)
 * joinRoom(roomName)
 * watchOffersAnswers(interval)
 * acceptOffer(offerId) OR acceptAnswer(answerId)
 * when the handleDCStatusChange shows the dataChannel is open, use send(message) to communicate with the remote peer
 *
 */

const WebSocket = require('rpc-websockets').Client

/*** STATE ***/

let server = null
let ourId = null
let theirId = null
let room = 'empty'
const events = {}
const peers = {}
let survivingPeer = null
let offeringPeer = null
let answeringPeer = null
let dataChannel = null

/*** MAIN FUNCTIONS ***/

function init(userId, uri) {
  // Set user ID
  ourId = userId

  // Connect to server
  server = new WebSocket(uri)

  // Set up offering peer
  offeringPeer = new RTCPeerConnection()

  // Set up offering peer's data channel
  dataChannel = offeringPeer.createDataChannel("dataChannel")
  dataChannel.onopen = handleDCStatusChange
  dataChannel.onmessage = handleReceiveMessage
  dataChannel.onclose = handleDCStatusChange

  // Set up answering peer
  answeringPeer = new RTCPeerConnection()

  // Allow answering peer to accept a data channel from an offer
  answeringPeer.ondatachannel = handleReceiveDataChannel
}

function whenServerReady(callback) {
  server.on('open', callback)
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

function listenEvent(eventType, callback) {
  events[eventType] = eventName(eventType, ourId)
  server.call('addEvent', [events[eventType]])
  server.subscribe(events[eventType])
  server.on(events[eventType], async (e) => {
    callback(e)
  })
}

function stopListen(eventType) {
  server.unsubscribe(events[eventType])
}

async function updatePeers() {
  const ids = await rollCall()

  // add any new ids on the server to client storage
  ids.forEach(id => {
    if (!peers[id]) {
      peers[id] = "Here!"
    }
  })

  // remove any ids in the client missing from the server
  for (id in peers) {
    if (ids.indexOf(id) < 0) {
      delete peers[id]
    }
  }
}

async function sendOffer(id) {
  // leave the matchmaking system & start the connecting process
  delete answeringPeer
  leaveRoom()
  stopListen('offer')
  survivingPeer = offeringPeer
  theirId = id

  // send the offer
  const offer = await survivingPeer.createOffer()
  await survivingPeer.setLocalDescription(offer)
  server.call('triggerEvent', [eventName('offer', theirId), offer, ourId])
}

async function sendAnswer(id, offer) {
  // leave the matchmaking system & start the connecting process
  delete offeringPeer
  leaveRoom()
  stopListen('offer')
  stopListen('answer')
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
  stopListen('answer')

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

/*** CALLBACKS ***/

const handleDCStatusChange = (event) => {
  if (dataChannel) {
    console.log(`Data channel's status has changed: ${dataChannel.readyState}`)
  }
}

const handleReceiveMessage = (event) => {
  console.log(`Data channel received a message: ${event.data}`)
}

const handleReceiveDataChannel = (event) => {
  console.log('Received data channel')
  dataChannel = event.channel
  dataChannel.onopen = handleDCStatusChange
  dataChannel.onmessage = handleReceiveMessage
  dataChannel.onclose = handleDCStatusChange
}

const handleSendCandidate = (event) => {
  console.log('on candidate event')
  if (event.candidate) {
    const candidate = event.candidate
    console.log(`Sending candidate ${candidate} to ID ${theirId}`)
    server.call('triggerEvent', [eventName('candidate', theirId), candidate, ourId])
  }
}

/*** EXPORTS ***/

module.exports = {
  init,
  whenServerReady,
  joinRoom,
  rollCall,
  listenEvent,
  sendOffer,
  sendAnswer,
  acceptAnswer,
  addCandidate,
  peers
}
