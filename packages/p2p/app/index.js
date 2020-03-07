/* P2P peer discovery server
 * 
 * join a channel
 * show peers in the channel
 * leave a channel
 * 
 * use a websocket server like the mock metastore
 * 
 */

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

const CHANNELS = {}

server.register('joinChannel', ([channel, id, peer, userName]) => {
  console.log('joining channel')
  if (!CHANNELS[channel]) { CHANNELS[channel] = {} }
  if (CHANNELS[channel][id]) { console.log(`Error: ID '${id}' already in peer discovery channel '${channel}'`) }
  CHANNELS[channel][id] = { peer, userName }
  console.log(CHANNELS[channel])
})

server.register('listPeers', ([channel, id]) => {
  console.log('listing peers')
  if (!CHANNELS[channel]) { console.log(`Error: channel '${channel}' does not exist`) }
  let copy = Object.assign({}, CHANNELS[channel])
  delete copy[id]
  console.log('copy', copy)
  return copy
})

server.register('leaveChannel', ([channel, id]) => {
  if (!CHANNELS[channel]) { console.log(`Error: channel '${channel}' does not exist`) }
  if (!CHANNELS[channel][id]) { console.log(`Error: ID '${id}' does not exist in channel '${channel}'`) }
  delete CHANNELS[channel][id]
  if (Object.keys(CHANNELS[channel]).length === 0) { delete CHANNELS[channel] }
})