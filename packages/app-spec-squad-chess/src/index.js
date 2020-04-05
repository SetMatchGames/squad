/* global URLSearchParams */

import m from 'mithril'
import { metastore } from '@squad/sdk'

import chess from './rules.js'
import settings from './settings.json'
import state from './state.js'
import { Board } from './Board.js'
import FormatSelector from './FormatSelector.js'
import { Matchmaker } from './Matchmaker.js'

const App = {
  oninit: () => {
    squadInit()
  },
  view: () => {
    if (!state.squad.connection) {
      return m(
        '#app',
        'Connecting to Squad...'
      )
    }
    return m(
      '#app',
      m(Board),
      m(FormatSelector),
      m(Matchmaker)
    )
  }
}

async function squadInit () {
  console.log('Initializing squad chess with settings:', settings)

  metastore.webSocketConnection(settings.metastoreWs)

  metastore.on('open', async () => {
    console.log("metastore open")
    const formatDefs = await metastore.getGameFormats(settings.gameAddress) // metastore will load any new formats here
    state.squad.rawFormats = formatDefs.map(def => def.Format)
    const urlParams = new URLSearchParams(window.location.search)
    state.squad.loadedFormatIndex = urlParams.get('format')
    const formatToLoad = state.squad.rawFormats[state.squad.loadedFormatIndex]

    if (formatToLoad) {
      const components = await Promise.all(
        formatToLoad.components.map(metastore.getDefinition)
      )
      const pieces = components.map(
        c => JSON.parse(c.Component.data)
      ).reduce((ps, p) => {
        return Object.assign(ps, p)
      })

      state.squad.loadedFormat = Object.assign(JSON.parse(formatToLoad.data), { pieces })
      console.log('Loaded format', state.squad.loadedFormat)

      state.game = chess.createGame(state.squad.loadedFormat)
    }
    state.squad.connection = 'connected'
    console.log('Squad Connection:', state.squad.connection)
    m.redraw()
  })
}

m.mount(document.body, App)
