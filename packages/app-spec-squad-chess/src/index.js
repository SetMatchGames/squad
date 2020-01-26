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
  state.rawFormats = formatDefs.map(def => def.Format)
  const formatToLoad = state.rawFormats[0] // TODO build in a format selection interface

  const components = await Promise.all(
    formatToLoad.components.map(metastore.getDefinition)
  )
  const pieces = components.map(
    c => JSON.parse(c.Component.data)
  ).reduce((ps, p) => {
    return Object.assign(ps, p)
  })

  state['loadedFormat'] = Object.assign(JSON.parse(formatToLoad.data), { pieces })
  state['game'] = chess.createGame(state.loadedFormat)
  return "Squad Chess initialized"
}


metastore.webSocketConnection(settings.metastoreWs)

metastore.on("open", async () => {
  await init()
  console.log("initialized")
  m.mount(document.body, App)
})