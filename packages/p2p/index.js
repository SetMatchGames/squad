const swarm = require('discovery-swarm')
const getPort = require('get-port')
const crypto = require('crypto')

let peers = {}
let matchedPeer = false
const id = crypto.randomBytes(32)
let sw

async function listen() {
  sw = swarm({ id })
  const port = await getPort()
  sw.listen(port)
  console.log(`Listening on port ${port}`)
}

function joinChannel(channel, opts = {}) {
  sw.join(channel)
  sw.on('connection', (connection, info) => {
    const peerId = info.id.toString('hex')
    peers[peerId] = connection
    console.log(`First connection in channel ${channel} established: ${peerId}`)
    if (opts.matchFirst) {
      matchedPeer = peerId
      matchById(matchedPeer, channel)
      connection.on('data', data => {
        console.log(String(data))
      })
    }
  })
}

function matchById(targetId, oldChannel) {
  sw.leave(oldChannel)
  const hash = crypto.createHash('sha1')
  const newChannel = hash
    .update(consistentStringSplice(id.toString('hex'), targetId))
    .digest('hex')
  joinChannel(newChannel)
}

async function firstAvailableMatch(channel) {
  await listen()
  joinChannel(channel, { matchFirst: true })
}

function write(string) {
  if (matchedPeer) peers[matchedPeer].write(string)
}

function disconnect() {
  sw = null
}

function consistentStringSplice(s1, s2) {
  const orderedStrings = alphabetize(s1, s2, 0)
  return orderedStrings[0]+orderedStrings[1]
}

function alphabetize(s1, s2, i) {
  if (s1[i] > s2[i]) {
    return [s1, s2]
  } else if (s2[i] > s1[i]) {
    return [s2, s1]
  } else {
    return alphabetize(s1, s2, i+1)
  }
}

module.exports = {
  peers,
  matchedPeer,
  firstAvailableMatch,
  write
}

firstAvailableMatch('squadcheese').then()
setInterval(() => write('hello'), 1000)

