import m from 'mithril'
import { metastore } from '@squad/sdk'
import chess from './rules.js'
import settings from './settings.json'

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

async function init() {
  console.log("init squad chess", settings)

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
  
    state['loadedFormat'] = Object.assign(JSON.parse(formatToLoad.data), { pieces })
    console.log('loaded format', state.loadedFormat)
    state['game'] = chess.createGame(state.loadedFormat)
  }

  return "Squad Chess initialized"
}


metastore.webSocketConnection(settings.metastoreWs)

metastore.on("open", async () => {
  await init()
  console.log("initialized")
  m.mount(document.body, App)
})