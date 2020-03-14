let ourId
let theirId

let offeringPeer = new RTCPeerConnection()
offeringPeer.onicecandidate = handleIceCandidate

let dataChannel = offeringPeer.createDataChannel('offeringDC')
dataChannel.onopen = handleDCStatusChange
dataChannel.onmessage = handleReceiveMessage
dataChannel.onclose = handleDCStatusChange

let answeringPeer = new RTCPeerConnection()
answeringPeer.onicecandidate = handleIceCandidate
answeringPeer.ondatachannel = receiveDataChannelCallback

/* Connection flow:

join a channel/room (make an offer and put it in the the channel/room)
watch for peers in the room 
and
watch for answers from peers in the room
accept an offer from a peer (set theirId, stop watching for answers and peers, delete offering peer)
--> generate and send an answer to that peer
--> watch for and add any ice candidates from that peer
--> send that peer any ice candidates the offering peer generates
--> when data channel is 'open', we are ready to send messages
or
accept an answer from a peer (set theirId, stop watching for offers and peers, delete answering peer)
--> send that peer any ice candidates the offering peer generates
--> watch for and add any ice candidates from that peer
--> when data channel is 'open', we are ready to send messages


localConnection.createOffer()
  .then(offer => localConnection.setLocalDescription(offer))
  .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
  .then(() => remoteConnection.createAnswer())
  .then(answer => remoteConnection.setLocalDescription(answer))
  .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription))
  .catch(handleCreateDescriptionError)

*/

const handleIceCandidate = (event) => {
  if (event.candidate) {
    sendIceCandidate(event.candidate, theirId)
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
  dataChannel = event.channel
  dataChannel.onopen = handleDCStatusChange
  dataChannel.onmessage = handleReceiveMessage
  dataChannel.onclose = handleDCStatusChange
}

const receiveChannelCallback = (e) => {
  receiveChannel = e.channel
  receiveChannel.onmessage = handleReceiveMessage
  receiveChannel.onopen = handleReceiveChannelStatusChange
  receiveChannel.onclose = handleReceiveChannelStatusChange
}

function sendIceCandidate(candidate, target) {
  // server function call
}

function reset() {

}