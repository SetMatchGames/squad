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
  console.log("init squad chess", settings)
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
  const startingPosition = JSON.parse(format.data).startingPosition
  let turns = chess.generateTurns(startingPosition, 0)

  state['game'] = {
    position: startingPosition,
    turnNumber: 0,
    legalTurns: turns
  }

  state['pieces'] = pieces

  return "Squad Chess Initialized"
}


metastore.webSocketConnection(settings.metastoreWs)

metastore.on("open", async () => {
  await init()
  console.log("initialized")
  m.mount(document.body, App)
})
