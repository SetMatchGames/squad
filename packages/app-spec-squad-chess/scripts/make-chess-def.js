/* global process */

/*
This script is a hack job to make it easier to make test definitons
This can be a model for a true chess def builder, but this ain't it

Example empty board

node make-chess-def.js empty-board 8 8  // standard chess board
node make-chess-def.js empty-board 4 12 // long thin chess board

Example move-capture

node make-chess-def.js move-capture 1 1 100   // bishop
node make-chess-def.js move-capture 1 0 100   // rook
node make-chess-def.js move-capture 1 1 1     // half of a king
node make-chess-def.js move-capture 1 0 1     // the other half of a king
node make-chess-def.js move-capture 0 1 1 0   // pawn moves (ignore capture)
node make-chess-def.js move-capture 1 1 1 0 1 // pawn capture (ignore move)

*/

function uniquePairs (pairs) {
  const set = {}
  pairs.forEach(([a, b]) => {
    if (set[a] === undefined) {
      const o = {}
      o[b] = true
      set[a] = o
    } else {
      set[a][b] = true
    }
  })
  const as = Object.keys(set)
  const result = []
  as.forEach(a => {
    Object.keys(set[a]).forEach(b => {
      result.push([parseInt(a), parseInt(b)])
    })
  })
  return result
}

const TYPES = {
  "empty-board": ([_, __, ___, height, width]) => {
    // print an empty board of the specified size
    let board = {}
    // this semicolon is needed!!! JS is kinda BS
    ;[...Array(parseInt(height)).keys()].forEach(h => {
      [...Array(parseInt(width)).keys()].forEach(w => {
        board[`${h},${w}`] = {
          content: null,
          promotion: 1
        }
      })
    })
    console.log(JSON.stringify(board, null, 2))
  },
  "move-capture": ([_, __, ___, rise, run, steps, ...rotations]) => {
    rise = parseInt(rise)
    run = parseInt(run)
    steps = parseInt(steps)
    // generate a set of move and capture offsets
    if (rotations.length === 0) {
      rotations = [
        '0', // forward no negative
        '1', // forward negative first
        '2', // forward negative second
        '3', // forward negative both
        '4', // reverse no negative
        '5', // reverse negative first
        '6', // reverse negative second
        '7'  // reverse negative both
      ]
    }
    var offsets = []
    rotations.forEach(rotation => {
      var [a, b] = [...[rise, run]]
      switch (rotation) {
      case '0': // forward no negative
        break
      case '1': // forward negative first
        a = -a
        break
      case '2': // forward negative second
        b = -b
        break
      case '3': // forward negative both
        [a, b] = [-a, -b]
        break
      case '4': // reverse no negative
        [a, b] = [b, a]
        break
      case '5': // reverse negative first
        [a, b] = [-b, a]
        break
      case '6': // reverse negative second
        [a, b] = [b, -a]
        break
      case '7': // reverse negative both
        [a, b] = [-b, -a]
        break
      default:
        throw new Error(`invalid offset rotation ${rotation}`)
      }
      offsets.push([...[a, b]])
    })
    const params = uniquePairs(offsets).map(
      pair => { return {offset: pair, steps} }
    )
    console.log(
      JSON.stringify({move: params, capture: params}, null, 2)
    )
  },
  undefined: () => {
    console.log(`
use: node make-chess-def.js <type> <args>

types and args:

empty-board height width
offset rise run steps rotation(0,1,2,3)...
`)
  }
}

TYPES[process.argv[2]](process.argv)

