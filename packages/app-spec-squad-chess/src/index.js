import m from 'mithril'
import { metastore } from '@squad/sdk'
import chess from './rules.js'
import settings from './settings.json'
import Peer from 'peerjs'

import state from './state.js'
import Board from './Board.js'
import FormatSelector from './FormatSelector.js'

const App = {
  view: () => {
    return m(
      '#App',
      m(Board),
      m(FormatSelector)
    )
  }
}

async function init () {
  console.log('init squad chess', settings)

  const formatDefs = await metastore.getGameFormats(settings.gameAddress) // metastore will load any new formats here
  state.rawFormats = formatDefs.map(def => def.Format)
  const urlParams = new URLSearchParams(window.location.search)
  const formatToLoad = state.rawFormats[urlParams.get('format')]

  if (formatToLoad) {
    const components = await Promise.all(
      formatToLoad.components.map(metastore.getDefinition)
    )
    const pieces = components.map(
      c => JSON.parse(c.Component.data)
    ).reduce((ps, p) => {
      return Object.assign(ps, p)
    })

    state.loadedFormat = Object.assign(JSON.parse(formatToLoad.data), { pieces })
    console.log('loaded format', state.loadedFormat)
    const seedId = `${settings.gameAddress}${urlParams.get('format')}-0`
    console.log('seedId', seedId)
    const peer = new Peer('Ezra12345678')
    peer.connect('Jesse12345678')
    
    // const peer = validPeer(seedId)
    // connectToAnyPeer(seedId, peer)

    state.game = chess.createGame(state.loadedFormat)
  }

  return 'Squad Chess initialized'
}

function validPeer(id) {
  let validPeer = false
  let peer
  while (!validPeer) {
    console.log(id, nextPeerId(id))
    id = nextPeerId(id)
    peer = new Peer(id, {
      host: 'localhost',
      port: 9000,
      path: 'peer-discovery'
    })
    validPeer = !peer.destroyed
  }
  return peer
}

function connectToAnyPeer(id, peer) {
  let connected = 0
  while (connected < 10) {
    console.log('connect', id, nextPeerId(id))
    id = nextPeerId(id)
    peer.connect(id)
    console.log(peer)
    connected += 1
  }
}

function nextPeerId(id) {
  console.log('previous id', id)
  let [seedId, n] = id.split('-')
  n = parseInt(n) + 1
  console.log('n', n)
  return `${seedId}-${n}`
}

metastore.webSocketConnection(settings.metastoreWs)

metastore.on('open', async () => {
  await init()
  console.log('initialized')
  m.mount(document.body, App)
})
