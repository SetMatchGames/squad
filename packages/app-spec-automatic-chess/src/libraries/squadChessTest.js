const chess = require('./squadChessRules.js')

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
    }
  },
  king: {
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
    king: true
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
let state = {
  position: mockStartingPosition,
  turnNumber: 0,
  legalTurns: turns
}
console.log(state, state.legalTurns)
let newState = chess.takeTurn(state, turns[0])
console.log(newState, newState.legalTurns)