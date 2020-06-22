/* global URLSearchParams */

import m from 'mithril'
import squad, { metastore, curationMarket } from '@squad/sdk'

import chess from './rules.js'
import settings from './settings.json'
import state from './state.js'
import { Board } from './Board.js'
import FormatSelector from './FormatSelector.js'
import { Matchmaker } from './Matchmaker.js'
import ComponentForm from './ComponentForm.js'
import FormatForm from './FormatForm.js'
import { findBoardRange } from './utils.js'

import defs from '../scripts/load_development_defs.js'

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
      m(Matchmaker),
      m(ComponentForm),
      m(FormatForm)
    )
  }
}

async function squadInit () {
  console.log('Initializing squad chess with settings:', settings)

  // connect to the metastore
  metastore.webSocketConnection(settings.metastoreWs)

  metastore.on('open', async () => {
    // skip if we've already loaded a format
    if (state.squad.loadedFormat) {
      console.log('Skipping on open')
      return
    }

    console.log('metastore open')

    // load up the default definitions (only relevant with the temporary metastore)
    const defaultDefs = await defs()
    console.log('default defs', defaultDefs)

    // submit the default definitions to make sure they have bonds on ethereum
    defaultDefs.forEach(async (def) => {
      await squad.definition(def, [settings.gameAddress])
    })

    // get all the game's formats and components
    const formatDefs = await metastore.getGameFormats(settings.gameAddress)
    const componentDefs = await metastore.getGameComponents(settings.gameAddress)
    for (const key in formatDefs) {
      formatDefs[key] = formatDefs[key].Format
    }
    state.squad.rawFormats = formatDefs

    // for each format, see if the current user owns the format
    Object.keys(formatDefs).forEach((address) => {
      curationMarket.getBalance(address).then((balance) => {
        state.owned[address] = balance.toNumber()
        m.redraw()
      })
    })

    // take the extra 'Component' part of the objects
    for (const key in componentDefs) {
      componentDefs[key] = componentDefs[key].Component
    }

    state.squad.components = componentDefs

    // if a format is being loaded, get its key from the url
    const urlParams = new URLSearchParams(window.location.search)
    state.squad.loadedFormatKey = urlParams.get('format')
    const formatToLoad = state.squad.rawFormats[state.squad.loadedFormatKey]

    // load the format
    if (formatToLoad) {
      const components = await metastore.getDefinitions(formatToLoad.components)
      const pieces = {}
      for (const address in components) {
        pieces[address] = JSON.parse(components[address].Component.data)
      }
      state.squad.loadedFormat = Object.assign(JSON.parse(formatToLoad.data), { pieces })

      // Get the X and Y ranges of the board
      const xRange = findBoardRange(0, state.squad.loadedFormat.startingPosition)
      const yRange = findBoardRange(1, state.squad.loadedFormat.startingPosition)
      state.squad.loadedFormat.boardRanges = { x: xRange, y: yRange }

      console.log('Loaded format', state.squad.loadedFormat)

      state.game = chess.createGame(state.squad.loadedFormat)
    }

    state.squad.connection = 'connected'
    console.log('Squad Connection:', state.squad.connection)
    m.redraw()
  })
}

m.mount(document.body, App)
