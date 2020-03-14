/* 
 * p2p library for connecting with peers
 * join a channel (call to the peer discovery server)
 * show peers in a channel (call to the peer discovery server)
 * send an offer to one specific peer at a time using an initiating node (sending a new offer replaces)
 * store incoming offers sent to a non-initiating node
 * accept a specific offer using the non-initiating node
 * if your offer is accepted, delete your non-initiating node and leave the channel
 * if you accept an offer, delete your initiating node and leave the channel
 * 
 * To do this without simple-peer, directly with webRTC, we need:
 * on start up, create an offer, and join a channel with it.
 * if you see an offer you like in the channel, set your local description to it,
 * then create an answer, set your local description to it, and upload the answer to the server.
 * If you see an answer to your offer, you can set your local description to that answer
 * 
 * Maybe we need to pass ice candidates back and forth after this stuff??
 * 
 */

const crypto = require('crypto')
const WebSocket = require('rpc-websockets').Client
// const Peer = require('simple-peer')
// var wrtc = require('wrtc')

const id = crypto.randomBytes(32).toString('hex')
let discovery
let user
let target
let channel
// let initiatingPeer = new Peer({ initiator: true, wrtc })
// let receivingPeer = new Peer({ wrtc })
const offeringPeer = new RTCPeerConnection()
const answeringPeer = new RTCPeerConnection()
let dc
createDataChannel(offeringPeer, 'dataChannel')
createDataChannel(answeringPeer, 'DataChannel')
offeringPeer.onconnectionstatechange = (e) => {
  console.log('Offering peer connection state changed', e)
}
answeringPeer.onconnectionstatechange = (e) => {
  console.log('Answering peer connection state changed', e)
}
offeringPeer.onicecandidate = (e) => {
  if (e.candidate) {
    discovery.call('sendCandidate', [channel, target, id, e.candidate, user])
    console.log('readyState:', offeringPeer.connectionState, dc.readyState)
    console.log('Offering peer received ice candidate', e)
  }
}
answeringPeer.onicecandidate = (e) => {
  if (e.candidate) {
    discovery.call('sendCandidate', [channel, target, id, e.candidate, user])
    console.log('readyState:', answeringPeer.connectionState, dc.readyState)
    console.log('Answering peer received ice candidate', e)
  }
}
offeringPeer.ondatachannel = (e) => {
  console.log('readyState:', offeringPeer.connectionState, dc.readyState)
  console.log('Offering peer received data channel:', e)
}
answeringPeer.ondatachannel = (e) => {
  console.log('readyState:', answeringPeer.connectionState, dc.readyState)
  console.log('Answering peer received data channel:', e)
}
let answers = {}
// let connection = null

function webSocketConnection (uri) {
  console.log('connecting')
  discovery = new WebSocket(uri)
  return discovery
}

function on (message, f) {
  discovery.on(message, f)
}

function watchOffers (cb) {
  console.log(`Watching for peers in join-${channel}`)
  discovery.subscribe(`join-${channel}`)
  discovery.on(`join-${channel}`, async () => {
    console.log(`Detected join in ${channel}`)
    const peers = await discovery.call('listPeers', [channel, id])
    cb(peers)
  })
}

function leaveChannel (channel) {
  discovery.call('leaveChannel', [channel, id])
}

// Record your username, create your peers, and register your offer in a matchmaking channel.
async function offerMatch (channelName, userName) {
  user = userName
  channel = channelName
  const offer = await offeringPeer.createOffer()
  await offeringPeer.setLocalDescription(new RTCSessionDescription(offer))
  discovery.call('joinChannel', [channel, id, offeringPeer.localDescription, user])
  /* 
  initiatingPeer.on('signal', (offer) => {
    console.log(offer)
    user = userName
    channel = channelName
    // discovery.call('joinChannel', [channel, id, JSON.stringify(offer), user])
  })
  */
}

// Respond to another person's offer, generating an "answer."
// Send that answer to your target via a server event, then listen for a connection.
// Leave the channel and delete the unused peer.
async function sendAnswer (offer, targetId, targetUser) {
  console.log('sending answer...')
  target = targetId
  // createDataChannel(answeringPeer, 'DataChannel')
  await answeringPeer.setRemoteDescription(offer)
  const answer = await answeringPeer.createAnswer()
  await answeringPeer.setLocalDescription(new RTCSessionDescription(answer))
  console.log(`sending answer: ${answeringPeer.localDescription}, targetId: ${target}`)
  discovery.call('sendAnswer', [channel, target, id, answeringPeer.localDescription, user])
  /*
  target = targetId
  receivingPeer.on('signal', (answer) => {
    discovery.call('sendAnswer', [target, id, answer, user])
  })
  receivingPeer.signal(incomingOffer)

  initiatingPeer = null
  leaveChannel(channel)

  receivingPeer.on('connect', () => {
    connection = { id: target, userName: targetUser }
    initiatingPeer.send(`Greetings from ${user}!`)
  })
  */
}

// Listen for answers to your offer.
function watchAnswers (cb) {
  const event = `answer-${channel}`
  console.log(`Watching for answers in ${event}`)
  discovery.subscribe(event)
  discovery.on(event, (data) => {
    if (data.targetId === id) {
      console.log(`Detected answer in ${event} to ${id}`)
      answers[data.id] = { answer: data.answer, userName: data.userName }
      cb(data)
    }
  })
}

// Accept an answer to your offer, then wait for a connection.
// Leave the channel and delete the unused peer.
async function acceptAnswer (answerId) {
  console.log('Accepting answer...')
  const answer = answers[answerId].answer
  const targetUser = answers[answerId].userName
  await offeringPeer.setRemoteDescription(answer)

  /*
  initiatingPeer.signal(answer)

  receivingPeer = null
  leaveChannel(channel)

  initiatingPeer.on('connect', () => {
    connection = { id: answerId, userName: targetUser }
    initiatingPeer.send(`Greetings from ${user}!`)
  })
  */
}

function watchCandidates (cb) {
  const event = `candidate-${channel}`
  console.log(`Watching for caandidates in ${event}`)
  discovery.subscribe(event)
  discovery.on(event, (data) => {
    if (data.targetId === id) {
      console.log(`Detected candidate in ${event} to ${id}`)
      cb(data)
    }
  })
}

function createDataChannel(peer, label) {
  console.log('peer when creating dc:', peer)
  dc = peer.createDataChannel(label)
  console.log('creating data channel:', dc)

  dc.onopen = () => {
    console.log('datachannel opened')
  }
  dc.onmessage = (event) => {
    console.log(`received: ${event.data}`)
  }
  dc.onclose = () => {
    console.log('datachannel closed')
  }

}

const sendQueue = []

function send (msg) {
  switch(dc.readyState) {
    case "connecting":
      console.log("Connection not open; queueing: " + msg);
      sendQueue.push(msg);
      break;
    case "open":
      sendQueue.forEach((msg) => dataChannel.send(msg));
      break;
    case "closing":
      console.log("Attempted to send message while closing: " + msg);
      break;
    case "closed":
      console.log("Error! Attempt to send while connection closed.");
      break;
  }
}

function reset () {
  user = null
  target = null
  channel = null
  initiatingPeer = new Peer({ initiator: true })
  receivingPeer = new Peer()
  answers = {}
  connection = null
}

function close () {
  discovery.close()
}

webSocketConnection('ws://localhost:8889')

module.exports = {
  webSocketConnection,
  offerMatch
}


on('open', async () => {
  console.log('Peer discovery server connection open')
  // joinChannel('games', 'offer', 'ezra')
  await offerMatch('games', 'ezra')
  let peers
  watchOffers(async (peerList) => {
    console.log('peerlist', peerList)
    peers = peerList
    const peerId = Object.keys(peers)[Object.keys(peers).length-1]
    const offer = peers[peerId].offer
    const userName = peers[peerId].userName
    await sendAnswer(offer, peerId, userName)
  })
  watchAnswers(async (data) => {
    console.log('got answer data:', data)
    await acceptAnswer(data.id)
    send('Hello from the moon!')
  })
  watchCandidates(data => {
    console.log('got candidate data:', data)
    if (data.candidate) {
      offeringPeer.addIceCandidate(data.candidate)
      answeringPeer.addIceCandidate(data.candidate)
    }
  })
})