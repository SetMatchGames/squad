/*
 * SQUAD CHESS RULES ENGINE
 * 
 * This library takes in a game state (board position, turn number, and legal moves) and an action (a move), 
 * then returns a new state and set of legal moves.
 * 
 * General architecture: Take in a board state and an action (move), 
 * return a new state and a list of legal moves.
 * 
 * DATA TYPES
 * move = { from: [0,1], to: [4,6] }
 * state = { position: {'0,1': {pieceId, player: 0||1}... }, turn: 14 }
 * PIECES = { pieceId: { name: 'rook', mechanics: { 'move': [moveInputs] }}} (come from 'component' definitions)
 * MECHANICS = { 'mechanic name': function that takes move inputs, returns moves } (come from 'game' definition)
 * 
 */

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

const registerPieces = (pieces) => {
  PIECES = pieces
}

const makePosition = (position, move) => {
  let newPosition = Object.assign(position)
  newPosition[move.to] = position[move.from]
  newPosition[move.from] = null
  return newPosition
}

const generateMoves = (position, turn) => {
  let moves = []
  let king = false
  for (square in position) {
    // check that there is a piece
    if (position[square] === null) { continue }
    // check that the piece is the correct color
    if (position[square].player !== turn % 2) { continue }
    // get the piece
    let piece = PIECES[position[square].pieceId]
    // if the piece has the 'king' property, mark king as true
    if (piece.king) { king = true }
    // for each of the piece's mechanics
    for (name in piece.mechanics) {
      let mechanic = MECHANICS[name]
      // gather moves for each input for that mechanic
      piece.mechanics[name].forEach(input => {
        // add any valid moves to the list
        moves = moves.concat(mechanic(input, stringToSquare(square), position, turn))
      })
    }
  }
  // if there was no king, return 0 valid moves
  if (king === false) { moves = [] }
  return moves
}

const takeTurn = ({ position, turn, legalMoves }, move) => {
  if (!move) { throw 'No move submitted!' }
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

// Exports
module.exports = { registerPieces, generateMoves, takeTurn }