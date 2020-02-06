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
 * state = {
 *   position: {
 *     '0,1': { content: { pieceId, player: 0||1 }, square data }...
 *   },
 *   turnNumber: 14,
 *   legalTurns: {
 *     from: { to: turn, to:...}, from...
 *   }
 * }
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
  move: (params, from, position, turnNumber) => {
    // params = { offset, steps } // this might eventually support turns based on arbitrary formula
    // offset = [x, y]
    const turns = {}
    let to = stringToSquare(from)
    const pieceId = position[from].content.pieceId
    // for each step
    for (let i = 0; i < params.steps; i++) {
      to = [to[0] + params.offset[0], to[1] + params.offset[1]]
      if (!(to in position)) { break } // if off board
      // TODO this was considering a promotable space "not empty" so you
      //      couldn't move into it
      if (position[to].content !== null && position[to].content.pieceId) { break } // if not empty
      const turn = {}
      turn[from] = Object.assign({}, position[from], { content: null }) // TODO what if it was promotable?
      turn[to] = Object.assign(
        {},
        position[to],
        { content: { pieceId, player: turnNumber % 2 } }
      )
      turns[to] = turn
    }
    return turns
  },
  capture: (params, from, position, turnNumber) => {
    // params = { offset, steps } // this might eventually support turns based on arbitrary formula
    // offset = [x, y]
    const turns = {}
    let to = stringToSquare(from)
    const pieceId = position[from].content.pieceId
    for (let i = 0; i < params.steps; i++) {
      to = [to[0] + params.offset[0], to[1] + params.offset[1]]
      if (!(to in position)) { break } // if off board
      if (position[to].content === null) { continue } // if empty
      if (position[from].content.player === position[to].content.player) { break } // if same color piece
      const turn = {}
      turn[from] = Object.assign({}, position[from], { content: null })
      turn[to] = Object.assign(
        {},
        position[to],
        { content: { pieceId, player: turnNumber % 2 } }
      )
      turns[to] = turn
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
  randomPromotion: (params, from, position, turns, turnNumber) => {
    // params = ['default', 'self', 'king']
    const newTurns = Object.assign({}, turns)
    const player = turnNumber % 2
    Object.keys(newTurns).forEach(square => {
      const newTurn = newTurns[square]
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
          const pieceId = promotionPieces[Math.round(Math.random() * (promotionPieces.length - 1), 1)]
          // promote the piece
          newTurn[square].content = { pieceId, player }
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
    position: FORMAT.startingPosition,
    turnNumber: 0,
    legalTurns: generateTurns(FORMAT.startingPosition, 0)
  }
}

const updatePosition = (position, turn) => {
  const newPosition = Object.assign({}, position, turn)
  return newPosition
}

const generateTurns = (position, turnNumber) => {
  let turns = {}
  let king = false
  for (const square in position) {
    // check that there is a piece
    if (position[square].content === null) { continue }
    // check that the piece is the correct color
    if (position[square].content.player !== turnNumber % 2) { continue }
    // get the piece
    const piece = FORMAT.pieces[position[square].content.pieceId]
    // if the piece has the 'king' property, mark king as true
    if (piece.king) { king = true }
    // for each of the piece's mechanics
    for (const mechanicName in piece.mechanics) {
      const mechanic = MECHANIC_FNS[mechanicName]
      // gather turns for each set of params for that mechanic
      piece.mechanics[mechanicName].forEach(p => {
        // orientation
        const params = Object.assign({}, p)
        let orientation = 2
        if (turnNumber % 2 === 0) {
          // if it exists, multiply by the white orientation
          if (FORMAT.orientation) { orientation = FORMAT.orientation.white }
        } else {
          // if it exists, multiple by the black orientation
          orientation = 0 // default to a 180d
          if (FORMAT.orientation) { orientation = FORMAT.orientation.black }
        }
        // do the rotations
        for (let i = 0; i < orientation; i++) {
          params.offset = [params.offset[1] * -1, params.offset[0]]
        }
        // generate turns with mechanic
        let newTurns = mechanic(params, square, position, turnNumber)
        // modify turns with admechanics
        if (piece.admechanics) {
          for (const admechanicName in piece.admechanics) {
            const admechanic = ADMECHANIC_FNS[admechanicName]
            piece.admechanics[admechanicName].forEach(params => {
              newTurns = admechanic(params, square, position, newTurns, turnNumber)
            })
          }
        }
        // add final turns to legal turns list
        turns[square] = Object.assign({}, turns[square], newTurns)
      })
    }
  }
  // if there was no king, return 0 valid turns
  if (king === false) { turns = [] }
  return turns
}

const takeTurn = ({ position, turnNumber, legalTurns }, [from, to]) => {
  if (!from || !to) { throw new Error('No "from" or "to" submitted!') }
  const legalTurnsFrom = legalTurns[from]
  if (!legalTurnsFrom) { throw new Error('Invalid "from" square!') }
  const legalTurn = legalTurnsFrom[to]
  if (!legalTurn) { throw new Error('Invalid "to" square!') }
  const newPosition = updatePosition(position, legalTurn)
  const newState = {
    position: newPosition,
    turnNumber: turnNumber + 1,
    legalTurns: generateTurns(newPosition, turnNumber + 1)
  }
  return newState
}

// Helpers
const stringToSquare = (string) => {
  return string.split(',').map(x => parseInt(x))
}

// Exports
module.exports = { createGame, takeTurn, stringToSquare }
