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
 */

const WebSocket = require('rpc-websockets').Client
const Peer = require('simple-peer')

let discovery

function webSocketConnection (uri) {
  discovery = new WebSocket(uri)
  return discovery
}

function on (message, f) {
  discovery.on(message, f)
}

async function joinChannel (channel, id, peer, userName) {
  discovery.call('joinChannel', [channel, id, peer, userName])
}

async function listPeers (channel, id) {
  discovery.call('listPeers', [channel, id])
}

async function leaveChannel (channel, id) {
  discovery.call('leaveChannel', [channel, id])
}

function close () {
  discovery.close()
}

webSocketConnection('ws://localhost:8889')

on('open', async () => {
  console.log('connection open')
  await joinChannel('games', '1234', 'peer', 'id')
  const channel = await listPeers('games', '1235')
  console.log(channel)
  close()
})
