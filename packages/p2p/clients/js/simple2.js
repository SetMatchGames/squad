/* How to use this library to create a p2p data connection:
 * 
 * init(userId, uri)
 * joinRoom(roomName)
 * watchOffersAnswers(interval)
 * acceptOffer(offerId) OR acceptAnswer(answerId)
 * when the handleDCStatusChange shows the dataChannel is open, use send(message) to communicate with the remote peer
 *
 */

const crypto = require('crypto')
const WebSocket = require('rpc-websockets').Client

/*** STATE ***/
let ourId = null
let theirId = null
let room = null
let offers = {}
let offerWatchInterval = null
let answers = {}
let answerEvent = null
let candidateEvent = null
let peer = null
let offeringPeer = null
let answeringPeer = null
let dataChannel = null
let server = null

/*** MAIN FUNCTIONS ***/

function init(userId, uri) {
  // Set user ID
  ourId = userId

  // Connect to server
  server = new WebSocket(uri)

  // Set up offering peer
  offeringPeer = new RTCPeerConnection()

  // Set up offer peer's data channel
  dataChannel = offeringPeer.createDataChannel("dataChannel")
  dataChannel.onopen = handleDCStatusChange
  dataChannel.onmessage = handleReceiveMessage
  dataChannel.onclose = handleDCStatusChange

  // Set up answering peer
  answeringPeer = new RTCPeerConnection()

  // Allow answering peer to accept a data channel from an offer
  answeringPeer.ondatachannel = receiveDataChannelCallback
}

function eventName(type, key) {
  return `${type}-${key}`
}

async function joinRoom(roomName) {
  // send offer to room
  room = roomName
  answerEvent = eventName("answer", ourId)
  const offer = await offeringPeer.createOffer()
  await offeringPeer.setLocalDescription(offer)
  sendOfferToRoom(offeringPeer.localDescription)
}

function watchOffersAndAnswers(interval) {
  // watch for other offers sent to the room
  offerWatchInterval = setInterval(async () => {
    offers = await getOffers()
  }, interval)

  // listen for answers to our offer
  subscribe(answerEvent, handleReceiveAnswer)
}

function startCandidateExchange() {
  // receive ICE candidates from remote peer
  candidateEvent = eventName("candidate", ourId)
  subscribe(candidateEvent, handleReceiveCandidate)

  // send ICE candidates we generate to remote peer
  peer.onicecandidate = handleSendCandidate
}

async function acceptOffer(offerId) {
  // commit to a local peer and a remote peer
  theirId = offerId
  peer = answeringPeer
  delete offeringPeer
  // stop watching for other offers / answers
  clearInterval(offerWatchInterval)
  unsubscribe(answerEvent)

  // accept their offer
  const offer = offers[offerId]
  await peer.setRemoteDescription(new RTCSessionDescription(offer))

  // create your answer
  const answer = await peer.createAnswer()
  await peer.setLocalDescription(answer)

  // send answer to remote peer
  sendAnswer(peer.localDescription)

  // exchange ICE candidates with remote peer until a match is found
  startCandidateExchange()
}

async function acceptAnswer(answerId) {
  // commit to a local peer and a remote peer
  theirId = answerId
  peer = offeringPeer
  delete answeringPeer
  // stop watching for other offers / answers
  clearInterval(offerWatchInterval)
  unsubscribe(answerEvent)

  // accept their answer
  const answer = answers[answerId]
  await peer.setRemoteDescription(answer)

  // exchange ICE candidates with remote peer until a match is found
  startCandidateExchange()
}

// Once dataChannel is open, use this to send messages
function send(message) {
  peer.send(message)
}

// Reset everything except the server connection (leave matchmaking)
function reset() {
  ourId = null
  theirId = null
  room = null
  offers = {}
  clearInterval(offerWatchInterval)
  offerWatchInterval = null
  answers = {}
  answerEvent = null
  candidateEvent = null
  peer = null
  offeringPeer = null
  answeringPeer = null
  dataChannel = null
}


/*** PEER DISCOVERY SERVER FUNCTIONS ***/

function onOpen(callback) {
  server.on('open', callback)
}

function subscribe(event, callback) {
  // watch for events and call callback
  console.log('subscribing to', event)
  server.subscribe(event)
  server.on(event, callback)
}

function unsubscribe(event) {
  // stop watching for events
  server.unsubscribe(event)
}

function sendOfferToRoom(offer) {
  // send data to server
  server.call('sendOffer', [offer, ourId, room, answerEvent])
}

async function getOffers() {
  return await server.call('getOffers', [ourId, room])
}

function sendAnswer(answer) {
  // trigger server event
  console.log('trying to send answer', eventName('answer', theirId))
  server.call('triggerAnswerEvent', [answer, eventName('answer', theirId)])
}

function sendCandidate(candidate) {
  // server function call
  console.log('trying to send candidate', eventName('candidate', theirId))
  server.call('triggerCandidateEvent', [candidate, eventName('candidate', theirId)])
}


/*** HANDLERS AND CALLBACKS ***/

const handleReceiveAnswer = (event) => {
  if (event.id === ourId) {
    console.log('received answer')
    answers[event.id] = event.answer
  }
}

const handleReceiveCandidate = (event) => {
  if (event.candidate && event.id === ourId) {
    console.log('received candidate')
    peer.addIceCandidate(event.candidate)
  }
}

const handleSendCandidate = (event) => {
  if (event.candidate) {
    sendCandidate(event.candidate, theirId)
  }
}

const handleDCStatusChange = (event) => {
  if (dataChannel) {
    console.log(`Offering peer data channel's status has changed: ${dataChannel.readyState}`)
  }
}

const handleReceiveMessage = (event) => {
  console.log(`Data channel received a message: ${event.data}`)
}

const receiveDataChannelCallback = (event) => {
  console.log('received data channel')
  dataChannel = event.channel
  dataChannel.onopen = handleDCStatusChange
  dataChannel.onmessage = handleReceiveMessage
  dataChannel.onclose = handleDCStatusChange
}

module.exports = {
  init,
  joinRoom,
  offers,
  acceptOffer,
  answers,
  acceptAnswer,
  send,
  reset
}

/*** TESTING ***/
const userId = crypto.randomBytes(16).toString('hex')

init(userId, 'ws://localhost:8889')
console.log(server)
onOpen(async () => {
  await joinRoom('squadChess')
  await watchOffersAndAnswers(1000)
  // server.call('addEvent')
  // server.subscribe('answer-cfc5f600d6e337b86b9702cd4a80f399')
  //server.on('answer-cfc5f600d6e337b86b9702cd4a80f399', (e) => {
  //  console.log('event!', e)
  // })
  server.call('triggerEvent')
  const intId = setInterval(async () => {
    const l = Object.keys(offers).length
    if (l > 0) {
      await acceptOffer(Object.keys(offers)[l-1])
      clearInterval(intId)
    }
  }, 2000)
})
