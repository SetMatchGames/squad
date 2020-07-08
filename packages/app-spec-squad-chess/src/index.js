/* global localStorage */

import m from 'mithril'
import squad, { metastore, curationMarket } from '@squad/sdk'

import chess from './rules.js'
import settings from './settings.js'
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

    // load up the local storage definitions along with the defaults (for now)
    let storedDefs = JSON.parse(localStorage.getItem('localDefinitions'))
    if (!storedDefs) {
      storedDefs = []
    }

    const localDefs = [...defaultDefs, ...storedDefs]

    // submit the default definitions to make sure they have bonds on ethereum
    localDefs.forEach(async (def) => {
      await squad.definition(def, [settings.gameAddress])
    })

    // get all the game's formats and components
    const formatDefs = await metastore.getGameFormats(settings.gameAddress)
    const componentDefs = await metastore.getGameComponents(settings.gameAddress)

    const localCatalog = []
    for (const key in formatDefs) {
      localCatalog.push(formatDefs[key])
    }
    for (const key in componentDefs) {
      localCatalog.push(componentDefs[key])
    }
    console.log('local Catalog size', localCatalog.length)
    localStorage.setItem('localDefinitions', JSON.stringify(localCatalog))

    // for each format, see if the current user owns the format
    for (const address in formatDefs) {
      // take out the extra 'Format' part of the objects
      formatDefs[address] = formatDefs[address].Format
      // see if the current user owns the format
      curationMarket.getBalance(address).then((balance) => {
        state.owned[address] = balance.toNumber()
        m.redraw()
      })
      // get the market cap
      curationMarket.getMarketCap(address).then((marketCap) => {
        state.marketCaps[address] = marketCap
        m.redraw()
      })
    }
    state.squad.rawFormats = formatDefs

    // for each component
    for (const address in componentDefs) {
      // take out the extra 'Component' part of the objects
      componentDefs[address] = componentDefs[address].Component
      // get the market cap
      curationMarket.getMarketCap(address).then((marketCap) => {
        state.marketCaps[address] = marketCap
        m.redraw()
      })
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
