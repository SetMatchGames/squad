/*
 * SQUAD CHESS RULES ENGINE
 * 
 * This library takes in a game state (board position, turn number, and legal moves) and an action (a move), 
 * then returns a new state and set of legal moves.
 * 
 */

// General architecture: 
  // now: take in a board state and an action (move), return a new state and a list of legal moves

// move = { from: [0,1], to: [4,6] }
// state = { position: {'0,1': {pieceId, player: 0||1}... }, turn: 14 }
// PIECES = { pieceId: { name: 'rook', mechanics: { 'move': [moveInputs] } }} (owned by 'component' definitions)
// MECHANICS = { 'move': function (takes moveInputs, returns [move])} (owned by 'game' definition)

const MECHANICS = {
  'move': (inputs, from, position, turn) => {
    // inputs = { offset, steps } // this might eventually support moves based on arbitrary formula
      // offset = [x, y]
    let moves = []
    let to = from
    // for each step
    for(let i = 0; i < inputs.steps; i++) {
      to = [to[0]+inputs.offset[0], to[1]+inputs.offset[1]]
      if (!(to in position)) { break } // if off board
      if (position[to] !== null) { break } // if not empty
      moves.push({
        'from': from,
        'to': to
      })
    }
    return moves
  },
  'capture': (inputs, from, position, turn) => {
    let moves = []
    let to = from
    for(let i = 0; i < inputs.steps; i++) {
      to = [to[0]+inputs.offset[0], to[1]+inputs.offset[1]]
      if (!(to in position)) { break } // if off board
      if (position[to] === null) { continue } // if empty
      if (position[from].player === position[to].player) { break } // if same color piece
      moves.push({
        'from': from,
        'to': to
      })
      break
    }
    return moves
  }
}

let PIECES = {}

const makePosition = (position, move) => {
  let newPosition = Object.assign(position)
  newPosition[move.to] = position[move.from]
  newPosition[move.from] = null
  return newPosition
}

const generateMoves = (position, turn) => {
  let moves = []
  for (square in position) {
    // check that there is a valid piece
    if (position[square] === null) { continue }
    console.log(position[square].player, turn, turn % 2)
    if (position[square].player !== turn % 2) { continue }
    // if a piece, look the piece up by its Id
    let pieceId = position[square].pieceId
    // for each of the piece's mechanics
    for (name in PIECES[pieceId].mechanics) {
      let mechanic = MECHANICS[name]
      // gather moves for each input for that mechanic
      PIECES[pieceId].mechanics[name].forEach(input => {
        // add any valid moves to the list
        moves = moves.concat(mechanic(input, stringToSquare(square), position, turn))
      })
    }
  }
  return moves
}

const takeTurn = ({ position, turn, legalMoves }, move) => {
  if (!move in legalMoves) { throw 'Submitted an illegal move!' }
  const newPosition = makePosition(position, move)
  const newState = {
    'position': newPosition,
    'turn': turn+1,
    'legalMoves': generateMoves(newPosition, turn+1)
  }
  return newState
}

// Helpers

function stringToSquare(string) {
  return string.split(',').map(x => parseInt(x))
}

// testing

const mockPieceList = {
  'pawn': {
    mechanics: {
      'move': [
        { offset: [0,1], steps: 1 }
      ],
      'capture': [
        { offset: [1,1], steps: 1 },
        { offset: [-1,1], steps: 1 }
      ]
    }
  },
  'knight': {
    mechanics: {
      'move': [
        { offset: [2,1], steps: 1 },
        { offset: [1,2], steps: 1 },
        { offset: [-2,1], steps: 1 },
        { offset: [-1,2], steps: 1 },
        { offset: [1,-2], steps: 1 },
        { offset: [2,-1], steps: 1 },
        { offset: [-2,-1], steps: 1 },
        { offset: [-1,-2], steps: 1 }
      ],
      'capture': [
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
  'rook': {
    mechanics: {
      'move': [
        { offset: [0,1], steps: 100 },
        { offset: [0,-1], steps: 100 },
        { offset: [1,0], steps: 100 },
        { offset: [-1,0], steps: 100 }
      ],
      'capture': [
        { offset: [0,1], steps: 100 },
        { offset: [0,-1], steps: 100 },
        { offset: [1,0], steps: 100 },
        { offset: [-1,0], steps: 100 }
      ]
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
  '1,1': null,
  '1,2': null,
  '1,3': null,
  '2,0': null,
  '2,1': {
    pieceId: 'pawn',
    player: 1
  },
  '2,2': {
    pieceId: 'pawn',
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

PIECES = mockPieceList
let moves = generateMoves(mockStartingPosition, 0)
let state = {
  position: mockStartingPosition,
  turn: 0,
  legalMoves: moves
}
console.log(state, state.legalMoves)
let newState = takeTurn(state, moves[0])
console.log(newState, newState.legalMoves)