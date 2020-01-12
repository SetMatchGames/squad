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

let FORMAT
let PIECES

const registerPieces = (pieces) => {
  PIECES = pieces
}

// Notes for orientation (should now be done)
  // in the format metadata, optionally give an "orientation" for each color
  // orientation has 4 possible values--0, 1, 2, 3--corresponding to cardinal directions
  // white defaults to 0 and black to 2 if no orientations are given
  // orientation causes rotation of offsets when generating moves: 0: 0d, 1: 90d, 2: 180d, 3: 270d
  // this lets us make formats where white moves up and black moves left, for example.
  // this could also be done per piece, but then it seems redundant with the offsets themselves
  // Note: this doesn't seem like the most useful mechanic, except for Vitalik's stupid diagonal chess variant XD

// Notes for promotion
  // promotion should be a mechanic on pieces AND something marked in the format
  // in the format's starting position (board), 'promotion squares' are labeled 
  // separately for white and black
  // when generating moves, the promotion mechanic checks if a piece is on a 
  // promotion square of the proper color, and if it is, offers the player a promotion
  // format of the position changes: empty squares are no longer null, but their 'piece' field is null

const registerFormat = (format) => {
  FORMAT = format
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
        // orientation
        let params = Object.assign({}, p)
<<<<<<< HEAD
        let orientation = 0
        if (turnNumber % 2 === 0) {
          // if it exists, multiply by the white orientation
          if (FORMAT.orientation.white) { orientation = FORMAT.orientation.white }
        } else {
          // if it exists, multiple by the black orientation
          orientation = 2 // default to a 180d
          if (FORMAT.orientation.black) { orientation = FORMAT.orientation.black }
        }
        for (let i = 0; i < orientation; i++) {
          params.offset = [ params.offset[1] * -1, params.offset[0] ]
=======
        if (turnNumber % 2 === 1) {
          params.offset = params.offset.map(p => p*-1)
>>>>>>> develop
        }
        // add any valid turns to the list
        turns = turns.concat(
          mechanic(params, stringToSquare(square), position, turnNumber)
        )
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
