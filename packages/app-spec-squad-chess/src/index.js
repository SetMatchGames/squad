import m from 'mithril'
import { metastore } from '@squad/sdk'
import chess from './rules.js'
import Board from './Board.js'
import state from './state.js'
import settings from './settings.json'

const App = {
  view: () => {
    return m(Board)
  }
}

async function init() {
  metastore.webSocketConnection(settings.metastoreWs)
  const formatDefs = await metastore.getGameFormats(settings.gameAddress)
  state.formats = formatDefs.map(def => def.Format)
  const format = state.formats[0] // TODO build in a format selection interface
  console.log(format)
  const components = await Promise.all(
    format.components.map(metastore.getDefinition)
  )
  const pieces = components.map(
    c => JSON.parse(c.Component.data)
  ).reduce((ps, p) => {
    return Object.assign(ps, p)
  })
  chess.registerPieces(pieces)
  chess.registerFormat(format)
  console.log(format)
  const position = format.data.startingPosition
  let legalTurns = chess.generateTurns(position, 0)

  state['game'] = {
    position,
    turnNumber: 0,
    legalTurns
  }

  state['pieces'] = pieces

  return "Squad Chess Initialized"
}

init().then((message) => {
  console.log(message, state)
  m.mount(document.body, App)
})
