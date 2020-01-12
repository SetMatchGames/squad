<<<<<<< HEAD
import m from "mithril"
import { metastore } from '@squad/sdk'
import chess from "./rules.js"
=======
import m from 'mithril'
import { metastore } from '@squad/sdk'
import chess from './rules.js'
>>>>>>> develop
import Board from './Board.js'
import state from './state.js'
import settings from './settings.json'

<<<<<<< HEAD
// TODO how will the app arrive at the initial game state?

const mockPieceList = {
  pawn: {
    mechanics: {
      move: [
        { offset: [0,1], steps: 1 }
      ],
      capture: [
        { offset: [1,1], steps: 1 },
        { offset: [-1,1], steps: 1 }
      ]
    },
    graphics: {
      local: {
        white: 'chesspieces/wikipedia/wP.png',
        black: 'chesspieces/wikipedia/bP.png'
      }
    }
  },
  knight: {
    mechanics: {
      move: [
        { offset: [2,1], steps: 1 },
        { offset: [1,2], steps: 1 },
        { offset: [-2,1], steps: 1 },
        { offset: [-1,2], steps: 1 },
        { offset: [1,-2], steps: 1 },
        { offset: [2,-1], steps: 1 },
        { offset: [-2,-1], steps: 1 },
        { offset: [-1,-2], steps: 1 }
      ],
      capture: [
        { offset: [2,1], steps: 1 },
        { offset: [1,2], steps: 1 },
        { offset: [-2,1], steps: 1 },
        { offset: [-1,2], steps: 1 },
        { offset: [1,-2], steps: 1 },
        { offset: [2,-1], steps: 1 },
        { offset: [-2,-1], steps: 1 },
        { offset: [-1,-2], steps: 1 }
      ]
    },
    graphics: {
      local: {
        white: 'chesspieces/wikipedia/wN.png',
        black: 'chesspieces/wikipedia/bN.png'
      }
    }
  },
  rook: {
    mechanics: {
      move: [
        { offset: [0,1], steps: 100 },
        { offset: [0,-1], steps: 100 },
        { offset: [1,0], steps: 100 },
        { offset: [-1,0], steps: 100 }
      ],
      capture: [
        { offset: [0,1], steps: 100 },
        { offset: [0,-1], steps: 100 },
        { offset: [1,0], steps: 100 },
        { offset: [-1,0], steps: 100 }
      ]
    },
    graphics: {
      local: {
        white: 'chesspieces/wikipedia/wR.png',
        black: 'chesspieces/wikipedia/bR.png'
      }
    }
  },
  king: {
    king: true,
    mechanics: {
      move: [
        { offset: [0,1], steps: 1 },
        { offset: [0,-1], steps: 1 },
        { offset: [1,0], steps: 1 },
        { offset: [-1,0], steps: 1 },
        { offset: [1,1], steps: 1 },
        { offset: [-1,-1], steps: 1 },
        { offset: [1,-1], steps: 1 },
        { offset: [-1,1], steps: 1 }
      ],
      capture: [
        { offset: [0,1], steps: 1 },
        { offset: [0,-1], steps: 1 },
        { offset: [1,0], steps: 1 },
        { offset: [-1,0], steps: 1 },
        { offset: [1,1], steps: 1 },
        { offset: [-1,-1], steps: 1 },
        { offset: [1,-1], steps: 1 },
        { offset: [-1,1], steps: 1 }
      ]
    },
    graphics: {
      local: {
        white: 'chesspieces/wikipedia/wK.png',
        black: 'chesspieces/wikipedia/bK.png'
      }
    }
=======
const App = {
  view: () => {
    return m(Board)
>>>>>>> develop
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
  const startingPosition = JSON.parse(format.data).startingPosition
  let turns = chess.generateTurns(startingPosition, 0)

  state['game'] = {
    position: startingPosition,
    turnNumber: 0,
    legalTurns: turns
  }

<<<<<<< HEAD
// end brute force initial state

metastore.webSocketConnection('mock')
metastore.getDefinitionsFromCatalog(
  'Game', 'Game Catalog'
).then()
metastore.getDefinitionsFromCatalog(
  'Format', 'Format Catalog'
).then()
metastore.getGameFormats("bb46875009b53a74cdade17baebc0e0400767330f10dd797a4cc0840d52bd60e").then(console.log)
=======
  state['pieces'] = pieces
>>>>>>> develop

  return "Squad Chess Initialized"
}

init().then((message) => {
  console.log(message, state)
  m.mount(document.body, App)
})
