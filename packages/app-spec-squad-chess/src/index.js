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
        m(HeaderFooter, { content: 'Connecting to Squad...', id: 'header' })
      )
    }
    return m(
      '#app',
      m(HeaderFooter, { content: Title, id: 'header' }),
      m('.platform', m(Board)),
      m('.platform', m(FormatSelector)),
      m('.platform', m(Matchmaker)),
      m('.platform', m(ComponentForm)),
      m('.platform', m(FormatForm)),
      m(HeaderFooter, { content: Citation, id: 'footer' })
    )
  }
}

const HeaderFooter = {
  view: (vnode) => {
    return m(
      `#${vnode.attrs.id}.platform`,
      vnode.attrs.content
    )
  }
}

const Title = m('h1', 'Squad Chess')

const Citation = m(
  '.citation',
  'Non-standard chess icons made by ',
  m('a', { href: 'https://www.flaticon.com/authors/freepik' }, 'Freepik'),
  ' from ',
  m('a', { href: 'https://www.flaticon.com/' }, 'www.flaticon.com'),
  '.'
)

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
      const x = findBoardRange(0, state.squad.loadedFormat.startingPosition)
      const y = findBoardRange(1, state.squad.loadedFormat.startingPosition)
      state.squad.loadedFormat.boardSize = { x, y }

      console.log('Loaded format', state.squad.loadedFormat)

      state.game = chess.createGame(state.squad.loadedFormat)
    }

    state.squad.connection = 'connected'
    console.log('Squad Connection:', state.squad.connection)
    m.redraw()
  })
}

m.mount(document.body, App)
