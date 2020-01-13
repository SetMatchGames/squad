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
 * state = { position: {'0,1': { content: {pieceId, player: 0||1}, admechanics }... }, turnNumber: 14, [legal turns] }
 * PIECES = { pieceId: { name: 'rook', mechanics: { 'move': [moveInputs] }}} (come from 'component' definitions)
 * FORMAT = {  }
 * MECHANICS = { 'mechanic name': function that takes params, returns turns }
 * ADMECHANICS = { 'admechanic name': function that takes legal turns, returns modified turns }
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
      if (position[to].content !== null) { break } // if not empty
      turns.push({
        from,
        to,
        pieceId: position[from].content.pieceId
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
      if (position[to].content === null) { continue } // if empty
      if (position[from].content.player === position[to].content.player) { break } // if same color piece
      turns.push({
        from,
        to,
        pieceId: position[from].content.pieceId
      })
      break
    }
    return turns
  }
}

/* Admechanics : Mechanics as Adverbs : Verbs
 * Mechanics generate offsets (a piece moving from one square to another)
 * Admechanics *modify* offsets
 */
const ADMECHANICS = {
  'promotion': (params, turns, position, turnNumber) => {
    return turns.map(turn => {
      // if the 'to' square is promotoble for the right color
      if (position[turn.to].promotion === turnNumber % 2) {
        // allow promotion to any non-king piece used in the game by either player
        const promotionPieces = Object.keys(PIECES).filter(id => {
          return !PIECES[id].king && id !== turn.pieceId
        })
        // TODO let the player choose what to promote to
        // turn['promotion'] = promotionPieces
        // TODO for now, implement a random promotion
          // add a piece id to turns?
        const promotionPieceId = promotionPieces[Math.round(Math.random()*(promotionPieces.length-1),1)]
        turn.pieceId = promotionPieceId
      }
      return turn
    })
  }
}

let FORMAT
let PIECES

const registerPieces = (pieces) => {
  PIECES = pieces
}

const registerFormat = (format) => {
  FORMAT = JSON.parse(format.data)
}

const updatePosition = (position, turn) => {
  let newPosition = Object.assign({}, position)
  newPosition[turn.to].content = Object.assign(
    position[turn.from].content,
    { pieceId: turn.pieceId }
  )
  newPosition[turn.from].content = null
  return newPosition
}

const generateTurns = (position, turnNumber) => {
  let turns = []
  let king = false
  for (square in position) {
    // check that there is a piece
    if (position[square].content === null) { continue }
    // check that the piece is the correct color
    if (position[square].content.player !== turnNumber % 2) { continue }
    // get the piece
    let piece = PIECES[position[square].content.pieceId]
    // if the piece has the 'king' property, mark king as true
    if (piece.king) { king = true }
    // for each of the piece's mechanics
    for (name in piece.mechanics) {
      const mechanic = MECHANICS[name]
      // gather turns for each set of params for that mechanic
      piece.mechanics[name].forEach(p => {
        // orientation
        let params = Object.assign({}, p)
        let orientation = 0
        if (turnNumber % 2 === 0) {
          // if it exists, multiply by the white orientation
          if (FORMAT.orientation) { orientation = FORMAT.orientation.white }
        } else {
          // if it exists, multiple by the black orientation
          orientation = 2 // default to a 180d
          if (FORMAT.orientation) { orientation = FORMAT.orientation.black }
        }
        // do the rotations
        for (let i = 0; i < orientation; i++) {
          params.offset = [ params.offset[1] * -1, params.offset[0] ]
        }
        // generate turns with mechanic
        let newTurns = mechanic(params, stringToSquare(square), position, turnNumber)
        // modify turns with admechanics
        if (piece.admechanics) {
          for (name in piece.admechanics) {
            const admechanic = ADMECHANICS[name]
            piece.admechanics[name].forEach(params => {
              newTurns = admechanic(params, newTurns, position, turnNumber)
            })
          }
        }
        // add final turns to legal turns list
        turns = turns.concat(newTurns)
      })
    }
  }
  // if there was no king, return 0 valid turns
  if (king === false) { turns = [] }
  return turns
}

const takeTurn = ({ position, turnNumber, legalTurns }, turn) => {
  if (!turn) { throw 'No turn submitted!' }
  const legalTurn = turnLegality(turn, legalTurns)
  if (!legalTurn) {
    throw 'Submitted an illegal turn!'
  }
  const newPosition = updatePosition(position, legalTurn)
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
  let legal = false
  legalTurns.forEach(legalTurn => {
    if (legalTurn.from[0] === turn.from[0] &&
      legalTurn.from[1] === turn.from[1] &&
      legalTurn.to[0] === turn.to[0] &&
      legalTurn.to[1] === turn.to[1]) {
      legal = legalTurn
    }
  })
  return legal
}

// Exports
module.exports = { registerPieces, registerFormat, generateTurns, takeTurn, stringToSquare }
