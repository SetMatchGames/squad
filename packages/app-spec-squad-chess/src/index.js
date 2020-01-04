import m from "mithril"
import chess from "./rules.js"
import Board from './Board.js'
import state from './state.js'

// TODO how will the app arrive at the initial game state?
// TODO should we just manage state with redux?

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
  }
}

let mockStartingPosition = {
  '0,0': {
    pieceId: 'pawn',
    player: 0
  },
  '0,1': null,
  '0,2': null,
  '0,3': {
    pieceId: 'knight',
    player: 0
  },
  '1,0': {
    pieceId: 'rook',
    player: 0
  },
  '1,1': {
    pieceId: 'king',
    player: 0
  },
  '1,2': null,
  '1,3': null,
  '2,0': null,
  '2,1': {
    pieceId: 'pawn',
    player: 1
  },
  '2,2': {
    pieceId: 'king',
    player: 1
  },
  '2,3': null,
  '3,0': null,
  '3,1': {
    pieceId: 'knight',
    player: 1
  },
  '3,2': {
    pieceId: 'rook',
    player: 1
  },
  '3,3': null
}

chess.registerPieces(mockPieceList)
let turns = chess.generateTurns(mockStartingPosition, 0)

state['game'] = {
  position: mockStartingPosition,
  turnNumber: 0,
  legalTurns: turns
}

state['pieces'] = mockPieceList

// end initial state

const App = {
  view: () => {
    return m(Board)
  }
}

m.mount(document.body, App)