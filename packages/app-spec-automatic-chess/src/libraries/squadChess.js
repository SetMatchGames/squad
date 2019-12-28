/*
 * SQUAD CHESS
 * 
 * This library should be able to take in a list of custom pieces (fitting a standard data format) 
 * and a board state that includes those pieces, the turn number, and player whose turn it is,
 * then return all the legal moves.
 * 
 */

// Create piece abbreviations
let pieces = {}
const pieceCodenames = {}
const codenamePieces = {}

const makeCodenames = (pieceList) => {
  pieces = pieceList
  let codeDec = 1
  for (name in pieces) {
    let codeHex = codeDec.toString(16)
    if (codeHex.length < 2) { codeHex = '0' + codeHex }
    else if (codeHex.length > 2) { throw 'Exceeded max unique pieces' }
    codenamePieces[codeHex] = name
    pieceCodenames[name] = codeHex
    codeDec += 1
  }
}

// Create an empty board
let boardSize = 0
let boardTemplate = []
const board = {}

const makeEmptyBoard = (size) => {
  let square = 1
  boardSize = size
  const rowLengths = Array(boardSize).fill(boardSize)
  const rows = rowLengths.map((n) => {
    return Array(parseInt(n)).fill(1).map((x,y) => x + y)
  })
  boardTemplate = rows
  for (let i = 0; i < rows.length; i++) {
    for (let j = 0; j < rows[i].length; j++) {
      board[square] = null
      square += 1
    }
  }
}

// Generate a board state string
// These strings are what is passed back and forth between the ui, this library, the chess ai, etc.
let color = 'w'
let turns = 0

const generateState = () => {
  let boardState = ''
  let rowIndex = 0
  let rowLength = 0
  for (square in board) {
    rowLength += 1
    if (board[square] === null) {
      boardState += '00'
    } else {
      boardState += board[square]
    }
    if (rowLength === boardTemplate[rowIndex].length) {
      rowLength = 0
      rowIndex += 1
      if (rowIndex + 1 <= boardTemplate.length) { boardState += '/' }
    }
  }
  boardState += ` ${color} ${turns}`
  return boardState
}

// Update board from state

// Mechanics functions

const MECHANICS = {
  'move': ([rise, run, direction, maxSteps], from) => {
    // return to & any flags (remove piece)
    let offset = rise * boardSize + run * direction
    let steps = 0
    let outputs = []
    let to = from
    while (steps < maxSteps) {
      steps += 1
      to += offset
      if (to > boardSize * boardSize - 1) { break } // this needs to check if we went off the side of the board!!
      // squares on the left edge can't be approached by moving right
      // right edge can't be approached by moving left
      // etc.
      // how to check if a square is an edge square and which edge?
        // 
      // how to check if a move includes a cardinal direction?
        // rise, run, direction
        // (from % boardSize - to % boardSize) > 0 ? left : right (if 0, neither)
        // parseInt(from/boardSize) - parseInt(to/boardSize) > 0 ? down : up (if 0, neither)

      let square = board[to]
      if (square !== null) { break }
      outputs.push({to})
    }
    return outputs
  },
  'capture': ([rise, run, direction, maxSteps], from) => {
    let offset = rise * boardSize + run * direction
    let steps = 0
    let outputs = []
    let to = from
    while (steps < maxSteps) {
      steps += 1
      to += offset
      if (to > boardSize * boardSize - 1) { break }
      let square = board[to]
      if (square === null) { break }
      if (pieces[codenamePieces[square]].color === color) { break }
      outputs.push({to})
    }
    return outputs
  }
}

// Generate possible moves
  // cycle through all squares
    // if there is no piece or piece of the wrong color, next
    // if there is a piece of the right color, 
    // use its mechanics to generate all the possible moves it can make
    // and add them to the list

    // problem: if the board varies in size, 1-dimensional offsets/slopes 
    // don't work as easily. How can we convert a slope to an offset on any 
    // size and shape of board?
/*
    slope = [1,2]
    direction = 1 | -1
    from = 4
    to = 13

    8 9 10 11  12  13 [14] 15
    0 1  2  3  [4] 5  6    7 

    step = slope[0] * boardSize + slope[1] * direction

    substep = slope * boardSize (y axis) + 1 (x axis)
    # of substeps in step = smallest whole number divisible by slope / slope
    */
  
const generateMoves = () => {
  const moves = []

  for (square in board) {
    if (board[square] === null ) { continue }
    let codename = board[square]
    let piece = pieces[codenamePieces[codename]]
    for (name in piece.mechanics) {
      let mechanic = MECHANICS[name]
      for(let i = 0; i < piece.mechanics[name].length; i++) {
        let params = piece.mechanics[name][i]
        console.log(codenamePieces[codename], name, params, mechanic(params, parseInt(square)))
      }
    }
  }
}

// Move

// testing

const testBoardSize = 8
makeEmptyBoard(testBoardSize)
console.log('empty board', board, boardTemplate)

const testPieces = {
  'pawn': {
    'color': 'w',
    'mechanics': {
      'move': [
        [1, 0, 1, 1],
      ],
      'capture': [
        [1, 1, 1, 1],
        [1, 1, -1, 1]
      ]
    }
  },
  'queen': {
    'color': 'w',
    'mechanics': {
      'move': [
        [1, 0, 1, 100], //8
        [1, 1, 1, 100], //9
        [0, 1, 1, 100], //1
        [-1, 1, 1, 100], //-7
        [-1, 0, 1, 100], //-8
        [-1, 1, -1, 100], //-9
        [0, 1, -1, 100], //-1
        [1, 1, -1, 100] // 7
      ],
      'capture': [
        [1, 0, 1, 100],
        [1, 1, 1, 100],
        [0, 1, 1, 100], 
        [-1, 1, 1, 100], 
        [-1, 0, 1, 100],
        [-1, 1, -1, 100],
        [0, 1, -1, 100],
        [1, 1, -1, 100]
      ]
    }
  },
  'king': {
    'color': 'w',
    'mechanics': {
      'move': [
        [1, 0, 1, 1],
        [1, 1, 1, 1], 
        [0, 1, 1, 1], 
        [-1, 1, 1, 1], 
        [-1, 0, 1, 1], 
        [-1, 1, -1, 1], 
        [0, 1, -1, 1],
        [1, 1, -1, 1]
      ],
      'capture': [
        [1, 0, 1, 1],
        [1, 1, 1, 1],
        [0, 1, 1, 1], 
        [-1, 1, 1, 1], 
        [-1, 0, 1, 1],
        [-1, 1, -1, 1],
        [0, 1, -1, 1],
        [1, 1, -1, 1]
      ]
    }
  },
  'knight': {
    'color': 'w',
    'mechanics': {
      'move': [
        [1, 2, 1, 1],
        [-1, 2, 1, 1],
        [1, 2, -1, 1],
        [-1, 2, -1, 1]
      ],
      'capture': [
        [1, 2, 1, 1],
        [-1, 2, 1, 1],
        [1, 2, -1, 1],
        [-1, 2, -1, 1]
      ]
    }
  }
}
makeCodenames(testPieces)
console.log('piece codenames', pieceCodenames)

board[2] = pieceCodenames['pawn']
board[12] = pieceCodenames['queen']
console.log('board', board)

console.log('board state:', generateState())

generateMoves()
