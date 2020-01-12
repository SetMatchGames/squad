/*
 * SQUAD CHESS RULES
 *
 * This library takes in a game state (board position, turn number, and legal turns) and an action (a turn),
 * then returns a new state and set of legal turns.
 *
 * General architecture: Take in a board state and an action (turn),
 * return a new state and a list of legal turns.
 *
 * DATA TYPES
 * turn = { from: [0,1], to: [4,6] }
 * state = { position: {'0,1': {pieceId, player: 0||1}... }, turnNumber: 14 }
 * PIECES = { pieceId: { name: 'rook', mechanics: { 'move': [moveInputs] }}} (come from 'component' definitions)
 * MECHANICS = { 'mechanic name': function that takes params, returns turns } (come from 'game' definition)
 *
 */

const MECHANICS = {
  'move': (params, from, position, turnNumber) => {
    // params = { offset, steps } // this might eventually support turns based on arbitrary formula
      // offset = [x, y]
    let turns = []
    let to = from
    // for each step
    for(let i = 0; i < params.steps; i++) {
      to = [to[0]+params.offset[0], to[1]+params.offset[1]]
      if (!(to in position)) { break } // if off board
      if (position[to] !== null) { break } // if not empty
      turns.push({
        'from': from,
        'to': to
      })
    }
    return turns
  },
  'capture': (params, from, position, turnNumber) => {
    let turns = []
    let to = from
    for(let i = 0; i < params.steps; i++) {
      to = [to[0]+params.offset[0], to[1]+params.offset[1]]
      if (!(to in position)) { break } // if off board
      if (position[to] === null) { continue } // if empty
      if (position[from].player === position[to].player) { break } // if same color piece
      turns.push({
        'from': from,
        'to': to
      })
      break
    }
    return turns
  }
}

let PIECES = {}

const registerPieces = (pieces) => {
  PIECES = pieces
}

const updatePosition = (position, turn) => {
  let newPosition = Object.assign({}, position)
  newPosition[turn.to] = position[turn.from]
  newPosition[turn.from] = null
  return newPosition
}

const generateTurns = (position, turnNumber) => {
  let turns = []
  let king = false
  for (square in position) {
    // check that there is a piece
    if (position[square] === null) { continue }
    // check that the piece is the correct color
    if (position[square].player !== turnNumber % 2) { continue }
    // get the piece
    let piece = PIECES[position[square].pieceId]
    // if the piece has the 'king' property, mark king as true
    if (piece.king) { king = true }
    // for each of the piece's mechanics
    for (name in piece.mechanics) {
      const mechanic = MECHANICS[name]
      // gather turns for each set of params for that mechanic
      piece.mechanics[name].forEach(p => {
        // mirror the params by default for each color
        let params = Object.assign({}, p)
        if (turnNumber % 2 === 1) {
          params.offset = params.offset.map(p => p*-1)
        }
        // add any valid turns to the list
        turns = turns.concat(mechanic(params, stringToSquare(square), position, turnNumber))
      })
    }
  }
  // if there was no king, return 0 valid turns
  if (king === false) { turns = [] }
  return turns
}

const takeTurn = ({ position, turnNumber, legalTurns }, turn) => {
  if (!turn) { throw 'No turn submitted!' }
  if (!turnLegality(turn, legalTurns)) {
    throw 'Submitted an illegal turn!'
  }
  const newPosition = updatePosition(position, turn)
  const newState = {
    'position': newPosition,
    'turnNumber': turnNumber+1,
    'legalTurns': generateTurns(newPosition, turnNumber+1)
  }
  return newState
}

// Helpers
const stringToSquare = (string) => {
  return string.split(',').map(x => parseInt(x))
}

function turnLegality(turn, legalTurns) {
  let legality = false
  legalTurns.forEach(legalTurn => {
    if (legalTurn.from[0] === turn.from[0] &&
      legalTurn.from[1] === turn.from[1] &&
      legalTurn.to[0] === turn.to[0] &&
      legalTurn.to[1] === turn.to[1]) {
      legality = true
    }
  })
  return legality
}

// Exports
module.exports = { registerPieces, generateTurns, takeTurn, stringToSquare }
