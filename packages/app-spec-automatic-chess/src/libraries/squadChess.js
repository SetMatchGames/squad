/*
 * SQUAD CHESS
 * 
 * This library should be able to take in a list of custom pieces (fitting a standard data format) 
 * and a board state that includes those pieces, the turn number, and player whose turn it is,
 * then return all the legal moves.
 * 
 */

// Create piece abbreviations
let pieces = []
const pieceCodenames = {}
const codenamePieces = {}

const makeCodenames = (pieceList) => {
  pieces = pieceList
  let codeDec = 1
  for (let i = 0; i < pieces.length; i++) {
    let codeHex = codeDec.toString(16)
    if (codeHex.length < 2) { codeHex = '0' + codeHex }
    else if (codeHex.length > 2) { throw 'Exceeded max unique pieces' }
    codenamePieces[codeHex] = pieces[i].name
    pieceCodenames[pieces[i].name] = codeHex
    codeDec += 1
  }
}

// Create an empty board
let boardSize = 0
let boardTemplate = []
const board = {}

const makeEmptyBoard = (size) => {
  let square = 0
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

// update board from state

// Mechanics functions

const MECHANICS = {
  'move': ([rise, run, direction, maxSteps], from) => {

  },
  'capture': ([rise, run, direction, maxSteps], from) => {

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

  }
}

// Move

// testing

const testBoardSize = 4
makeEmptyBoard(testBoardSize)
console.log('empty board', board, boardTemplate)

const testPieces = [
  {
    'name': 'pawn',
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
  {
    'name': 'queen',
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
  {
    'name': 'king',
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
  }
]
makeCodenames(testPieces)
console.log('piece codenames', pieceCodenames)

board[2] = pieceCodenames['pawn']
board[12] = pieceCodenames['queen']

console.log('board state:', generateState())
