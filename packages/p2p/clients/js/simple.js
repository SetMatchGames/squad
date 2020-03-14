// To turn this into what we need, we have to:
// remove 'remoteConnection' and everything associated with it
// add the flow where we create two local peers: one for making offers, and one for accepting offers
// if you make an offer, delete the accepting peer
// if you accept an offer, delete the offering peer

function sendMessage(msg) {
  sendChannel.send(msg)
}

function disconnectPeers() {
  // Close the RTCDataChannels if they're open.
  sendChannel.close()
  receiveChannel.close()
  
  // Close the RTCPeerConnections
  localConnection.close()
  remoteConnection.close()

  sendChannel = null
  receiveChannel = null
  localConnection = null
  remoteConnection = null
}

const receiveChannelCallback = (e) => {
  receiveChannel = e.channel
  receiveChannel.onmessage = handleReceiveMessage
  receiveChannel.onopen = handleReceiveChannelStatusChange
  receiveChannel.onclose = handleReceiveChannelStatusChange
}

const handleSendChannelStatusChange = (e) => {
  if (sendChannel) {
    console.log(`Send channel's status has changed: ${sendChannel.readyState}`)
    if (sendChannel.readyState === 'open') {
      sendMessage('Hello world!')
    }
  }
}

const handleReceiveChannelStatusChange = (e) => {
  if (receiveChannel) {
    console.log(`Receive channel's status has changed: ${receiveChannel.readyState}`)
    if (receiveChannel.readyState === 'open') {
      receiveChannel.send('Hello back!')
    }
  }
}

const handleReceiveMessage = (e) => {
  console.log(`Data channel received a message: ${e.data}`)
}

const handleAddCandidateError = (err) => {
  console.log(`Error adding ICE candidate: ${err}`)
}

const handleCreateDescriptionError = (err) => {
  console.log(`Error creating description: ${err}`)
}

const localConnection = new RTCPeerConnection()

const sendChannel = localConnection.createDataChannel('sendChannel')
sendChannel.onopen = handleSendChannelStatusChange
sendChannel.onmessage = handleReceiveMessage
sendChannel.onclose = handleSendChannelStatusChange

const remoteConnection = new RTCPeerConnection()
remoteConnection.ondatachannel = receiveChannelCallback
let receiveChannel

localConnection.onicecandidate = (e) => {
  !e.candidate || remoteConnection.addIceCandidate(e.candidate)
    .catch(handleAddCandidateError)
}

remoteConnection.onicecandidate = (e) => {
  !e.candidate || localConnection.addIceCandidate(e.candidate)
    .catch(handleAddCandidateError)
}

localConnection.createOffer()
  .then(offer => localConnection.setLocalDescription(offer))
  .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
  .then(() => remoteConnection.createAnswer())
  .then(answer => remoteConnection.setLocalDescription(answer))
  .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription))
  .catch(handleCreateDescriptionError)