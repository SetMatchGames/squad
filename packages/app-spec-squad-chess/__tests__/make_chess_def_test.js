/* global test expect */

const makeChessDef = require('../scripts/make-chess-def.js')

function testMain (args) {
  // this is intended to be run from the console, so we stub out
  // the first two args in process.argv which would be node, and
  // the filename
  return makeChessDef.main([null, null, ...args])
}

const boardTestCases = [
  [['1', '1'], JSON.stringify({ '0,0': { content: null } }, null, 2)],
  [['0', '0'], '{}'],
  [['0', '1'], '{}'],
  [['1', '0'], '{}'],
  [['1', '2'], JSON.stringify({ '0,0': { content: null }, '0,1': { content: null } }, null, 2)],
  [['2', '1'], JSON.stringify({ '0,0': { content: null }, '1,0': { content: null } }, null, 2)]
]

test('empty-board makes the right boards', () => {
  boardTestCases.forEach(([args, expected]) => {
    expect(testMain(['empty-board', ...args])).toBe(expected)
  })
})

const bishop = {
  move: [
    { offset: [1, 1], steps: 100 },
    { offset: [1, -1], steps: 100 },
    { offset: [-1, 1], steps: 100 },
    { offset: [-1, -1], steps: 100 }],
  capture: [
    { offset: [1, 1], steps: 100 },
    { offset: [1, -1], steps: 100 },
    { offset: [-1, 1], steps: 100 },
    { offset: [-1, -1], steps: 100 }
  ]
}

const rook = {
  move: [
    { offset: [0, 1], steps: 100 },
    { offset: [0, -1], steps: 100 },
    { offset: [1, 0], steps: 100 },
    { offset: [-1, 0], steps: 100 }
  ],
  capture: [
    { offset: [0, 1], steps: 100 },
    { offset: [0, -1], steps: 100 },
    { offset: [1, 0], steps: 100 },
    { offset: [-1, 0], steps: 100 }
  ]
}

const knight = {
  move: [
    { offset: [1, 2], steps: 1 },
    { offset: [1, -2], steps: 1 },
    { offset: [2, 1], steps: 1 },
    { offset: [2, -1], steps: 1 },
    { offset: [-2, 1], steps: 1 },
    { offset: [-2, -1], steps: 1 },
    { offset: [-1, 2], steps: 1 },
    { offset: [-1, -2], steps: 1 }
  ],
  capture: [
    { offset: [1, 2], steps: 1 },
    { offset: [1, -2], steps: 1 },
    { offset: [2, 1], steps: 1 },
    { offset: [2, -1], steps: 1 },
    { offset: [-2, 1], steps: 1 },
    { offset: [-2, -1], steps: 1 },
    { offset: [-1, 2], steps: 1 },
    { offset: [-1, -2], steps: 1 }
  ]
}

const pawn = { // Note, this tool always give both move and capture
  move: [
    { offset: [1, 1], steps: 1 },
    { offset: [-1, 1], steps: 1 }
  ],
  capture: [
    { offset: [1, 1], steps: 1 },
    { offset: [-1, 1], steps: 1 }
  ]
}

const moveCaptureTestCases = [
  [['1', '1', '100'], JSON.stringify(bishop, null, 2)], // Bishop
  [['1', '0', '100'], JSON.stringify(rook, null, 2)], // Rook
  [['2', '1', '1'], JSON.stringify(knight, null, 2)], // Knight
  [['1', '1', '1', '0', '1'], JSON.stringify(pawn, null, 2)] // pawn (capture part)
]

test('move-capture makes the right offsets and steps', () => {
  moveCaptureTestCases.forEach(([args, expected]) => {
    expect(testMain(['move-capture', ...args])).toBe(expected)
  })
})
