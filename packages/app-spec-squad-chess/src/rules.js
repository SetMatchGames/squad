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
 * state = { position: {'0,1': { content: {pieceId, player: 0||1}, square data }... }, turnNumber: 14, legalTurns: [] }
 * turn = { '0,1': { content: { pieceId, player } }... }
 * FORMAT.pieces = { pieceId: { name: 'rook', mechanics: { 'move': [moveInputs] }}} (come from 'component' definitions)
 * FORMAT = { pieces, startingPosition: { position data }, OPTIONAL orientation: { white: 0, black: 2 } }
 * MECHANIC_FNS = { 'mechanic name': function that takes params, returns turns }
 * ADMECHANIC_FNS = { 'admechanic name': function that takes legal turns, returns modified turns }
 *
 */


// Mechanics are qualities of pieces that come with sets of params.
// Mechanic functions are their corresponding functions that generate legal turns using those params.
const MECHANIC_FNS = {
  'move': (params, from, position, turnNumber) => {
    // params = { offset, steps } // this might eventually support turns based on arbitrary formula
      // offset = [x, y]
    const turns = {}
    let to = stringToSquare(from)
    const pieceId = position[from].content.pieceId
    // for each step
    for(let i = 0; i < params.steps; i++) {
      to = [to[0]+params.offset[0], to[1]+params.offset[1]]
      toKey = squareToString(to)
      if (!(to in position)) { break } // if off board
      if (position[to].content !== null) { break } // if not empty
      const turnId = from+'->'+toKey
      let turn = {}
      turn[from] = Object.assign({}, position[from], { content: null })
      turn[toKey] = Object.assign(
        {}, 
        position[toKey], 
        { content: { pieceId, player: turnNumber % 2 } }
      )
      turns[turnId] = turn
    }
    return turns
  },
  'capture': (params, from, position, turnNumber) => {
    // params = { offset, steps } // this might eventually support turns based on arbitrary formula
      // offset = [x, y]
    let turns = {}
    let to = stringToSquare(from)
    const pieceId = position[from].content.pieceId
    for(let i = 0; i < params.steps; i++) {
      to = [to[0]+params.offset[0], to[1]+params.offset[1]]
      toKey = squareToString(to)
      if (!(to in position)) { break } // if off board
      if (position[to].content === null) { continue } // if empty
      if (position[from].content.player === position[to].content.player) { break } // if same color piece
      const turnId = from+'->'+toKey
      let turn = {}
      turn[from] = Object.assign({}, position[from], { content: null })
      turn[toKey] = Object.assign(
        {}, 
        position[toKey], 
        { content: { pieceId, player: turnNumber % 2 } }
      )
      turns[turnId] = turn
      break
    }
    return turns
  }
}

/* Admechanics are to mechanics as adverbs are to verbs.
 * Admechanics are like mechanics, qualities of pieces that come with sets of params,
 * BUT admechanic functions modify existing turns instead of creating new ones.
 * Use admechanics when you need a mechanic that modifies all of a piece's other mechanics.
 */ 
const ADMECHANIC_FNS = {
  'randomPromotion': (params, turns, position, turnNumber) => {
    // params = ['default', 'self', 'king']
    const newTurns = Object.assign({}, turns)
    const player = turnNumber % 2
    Object.keys(newTurns).forEach(turnId => {
      const newTurn = newTurns[turnId]
      // for each square in the turn
      Object.keys(newTurn).forEach(square => {
        // if there is a piece and its a promotion square of the right color
        if (newTurn[square].content && newTurn[square].promotion === player) {
          // create the list of possible promotions
          const promotionPieces = Object.keys(FORMAT.pieces).filter(id => {
            // if 'king' is in the params, allow promotion to king
            let allowKing = !FORMAT.pieces[id].king
            if (params.includes('king')) {
              allowKing = true
            }
            // if 'self' is in the params, allow promotion to self
            let allowSelf = (id !== newTurn[square].content.pieceId)
            if (params.includes('self')) {
              allowSelf = true
            }
            return allowKing && allowSelf
          })
          // pick a random piece to promote to
          const pieceId = promotionPieces[Math.round(Math.random()*(promotionPieces.length-1),1)]
          // promote the piece
          newTurn[square]['content'] = { pieceId, player }
        }
      })
    })
    return newTurns
  }
}

let FORMAT

const createGame = (format) => {
  FORMAT = format
  return {
    'position': FORMAT.startingPosition,
    'turnNumber': 0,
    'legalTurns': generateTurns(FORMAT.startingPosition, 0)
  }
}

const updatePosition = (position, turn) => {
  let newPosition = Object.assign({}, position, turn)
  return newPosition
}

const generateTurns = (position, turnNumber) => {
  let turns = {}
  let king = false
  for (square in position) {
    // check that there is a piece
    if (position[square].content === null) { continue }
    // check that the piece is the correct color
    if (position[square].content.player !== turnNumber % 2) { continue }
    // get the piece
    let piece = FORMAT.pieces[position[square].content.pieceId]
    // if the piece has the 'king' property, mark king as true
    if (piece.king) { king = true }
    // for each of the piece's mechanics
    for (name in piece.mechanics) {
      const mechanic = MECHANIC_FNS[name]
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
        let newTurns = mechanic(params, square, position, turnNumber)
        // modify turns with admechanics
        if (piece.admechanics) {
          for (name in piece.admechanics) {
            const admechanic = ADMECHANIC_FNS[name]
            piece.admechanics[name].forEach(params => {
              newTurns = admechanic(params, newTurns, position, turnNumber)
            })
          }
        }
        // add final turns to legal turns list
        turns = Object.assign(turns, newTurns)
      })
    }
  }
  // if there was no king, return 0 valid turns
  if (king === false) { turns = [] }
  return turns
}

const takeTurn = ({ position, turnNumber, legalTurns }, turnId) => {
  if (!turnId) { throw new Error('No turnId submitted!') }
  const legalTurn = legalTurns[turnId]
  if (!legalTurn) { throw new Error('Submitted an illegal turn!') }
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

const squareToString = (square) => {
  return `${square[0]},${square[1]}`
}

// Exports
module.exports = { createGame, takeTurn, stringToSquare, squareToString }
