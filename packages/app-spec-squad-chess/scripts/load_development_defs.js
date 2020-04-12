/* global process require */

const {
  on,
  webSocketConnection,
  createDefinition,
  getCatalogAddresses
} = require('@squad/sdk').metastore

const metastoreWs = require('../src/settings.json').metastoreWs

function conf (name, defaultValue) {
  var value = process.env[name]
  if (value === undefined) {
    value = defaultValue
  }
  if (value === undefined) {
    throw new Error(`Required configuration "${name}" not found.`)
  }
  return value
}

// TODO refactor system configuration
const uri = metastoreWs || conf(metastoreWs, 'ws://localhost:8888')
webSocketConnection(uri)

process.on('unhandledRejection', r => console.log(r))

async function main () {
  const squadChessAddress = await createDefinition({
    Game: {
      name: 'Squad Chess',
      type_: 'web-game-v0',
      data: JSON.stringify({
        url: 'http://localhost:3001'
      })
    }
  })

  const squadChessComponents = [{
    Component: {
      name: 'Rook',
      data: JSON.stringify({
        rook: {
          mechanics: {
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
          },
          graphics: {
            local: {
              white: 'chesspieces/wikipedia/wR.png',
              black: 'chesspieces/wikipedia/bR.png'
            }
          }
        }
      })
    }
  }, {
    Component: {
      name: 'King',
      data: JSON.stringify({
        king: {
          king: true,
          mechanics: {
            move: [
              { offset: [0, 1], steps: 1 },
              { offset: [0, -1], steps: 1 },
              { offset: [1, 0], steps: 1 },
              { offset: [-1, 0], steps: 1 },
              { offset: [1, 1], steps: 1 },
              { offset: [-1, -1], steps: 1 },
              { offset: [1, -1], steps: 1 },
              { offset: [-1, 1], steps: 1 }
            ],
            capture: [
              { offset: [0, 1], steps: 1 },
              { offset: [0, -1], steps: 1 },
              { offset: [1, 0], steps: 1 },
              { offset: [-1, 0], steps: 1 },
              { offset: [1, 1], steps: 1 },
              { offset: [-1, -1], steps: 1 },
              { offset: [1, -1], steps: 1 },
              { offset: [-1, 1], steps: 1 }
            ]
          },
          graphics: {
            local: {
              white: 'chesspieces/wikipedia/wK.png',
              black: 'chesspieces/wikipedia/bK.png'
            }
          }
        }
      })
    }
  }, {
    Component: {
      name: 'Pawn',
      data: JSON.stringify({
        pawn: {
          mechanics: {
            move: [
              { offset: [0, 1], steps: 1 }
            ],
            capture: [
              { offset: [1, 1], steps: 1 },
              { offset: [-1, 1], steps: 1 }
            ]
          },
          admechanics: {
            randomPromotion: ['default']
          },
          graphics: {
            local: {
              white: 'chesspieces/wikipedia/wP.png',
              black: 'chesspieces/wikipedia/bP.png'
            }
          }
        }
      })
    }
  }, {
    Component: {
      name: 'Knight',
      data: JSON.stringify({
        knight: {
          mechanics: {
            move: [
              { offset: [2, 1], steps: 1 },
              { offset: [1, 2], steps: 1 },
              { offset: [-2, 1], steps: 1 },
              { offset: [-1, 2], steps: 1 },
              { offset: [1, -2], steps: 1 },
              { offset: [2, -1], steps: 1 },
              { offset: [-2, -1], steps: 1 },
              { offset: [-1, -2], steps: 1 }
            ],
            capture: [
              { offset: [2, 1], steps: 1 },
              { offset: [1, 2], steps: 1 },
              { offset: [-2, 1], steps: 1 },
              { offset: [-1, 2], steps: 1 },
              { offset: [1, -2], steps: 1 },
              { offset: [2, -1], steps: 1 },
              { offset: [-2, -1], steps: 1 },
              { offset: [-1, -2], steps: 1 }
            ]
          },
          graphics: {
            local: {
              white: 'chesspieces/wikipedia/wN.png',
              black: 'chesspieces/wikipedia/bN.png'
            }
          }
        }
      })
    }
  }, {
    Component: {
      name: 'Bishop',
      data: JSON.stringify({
        bishop: {
          mechanics: {
            move: [
              { offset: [1, 1], steps: 100 },
              { offset: [1, -1], steps: 100 },
              { offset: [-1, 1], steps: 100 },
              { offset: [-1, -1], steps: 100 }
            ],
            capture: [
              { offset: [1, 1], steps: 100 },
              { offset: [1, -1], steps: 100 },
              { offset: [-1, 1], steps: 100 },
              { offset: [-1, -1], steps: 100 }
            ]
          },
          graphics: {
            local: {
              white: 'chesspieces/wikipedia/wB.png',
              black: 'chesspieces/wikipedia/bB.png'
            }
          }
        }
      })
    }
  }, {
    Component: {
      name: 'Queen',
      data: JSON.stringify({
        queen: {
          mechanics: {
            move: [
              { offset: [0, 1], steps: 100 },
              { offset: [0, -1], steps: 100 },
              { offset: [1, 0], steps: 100 },
              { offset: [-1, 0], steps: 100 },
              { offset: [1, 1], steps: 100 },
              { offset: [1, -1], steps: 100 },
              { offset: [-1, 1], steps: 100 },
              { offset: [-1, -1], steps: 100 }
            ],
            capture: [
              { offset: [1, 1], steps: 100 },
              { offset: [1, -1], steps: 100 },
              { offset: [-1, 1], steps: 100 },
              { offset: [-1, -1], steps: 100 },
              { offset: [0, 1], steps: 100 },
              { offset: [0, -1], steps: 100 },
              { offset: [1, 0], steps: 100 },
              { offset: [-1, 0], steps: 100 }
            ]
          },
          graphics: {
            local: {
              white: 'chesspieces/wikipedia/wQ.png',
              black: 'chesspieces/wikipedia/bQ.png'
            }
          }
        }
      })
    }
  }]

  squadChessComponents.forEach(async (definition) => {
    await createDefinition(definition, [squadChessAddress])
    console.log('creating definition', definition)
  })

  const squadChessCatalog = await getCatalogAddresses(
    'Component',
    `${squadChessAddress} Component Catalog`
  )

  const pnrkFormat = {
    Format: {
      name: 'PNRK',
      components: [...squadChessCatalog],
      data: JSON.stringify({ // TODO implement this in the metastore Format type
        startingPosition: {
          '0,0': {
            content: {
              pieceId: 'pawn',
              player: 0
            },
            promotion: 1
          },
          '0,1': {
            content: null
          },
          '0,2': {
            content: null
          },
          '0,3': {
            content: {
              pieceId: 'knight',
              player: 0
            },
            promotion: 0
          },
          '1,0': {
            content: {
              pieceId: 'rook',
              player: 0
            },
            promotion: 1
          },
          '1,1': {
            content: {
              pieceId: 'king',
              player: 0
            }
          },
          '1,2': {
            content: null
          },
          '1,3': {
            content: {
              pieceId: 'king',
              player: 1
            },
            promotion: 0
          },
          '2,0': {
            content: null,
            promotion: 1
          },
          '2,1': {
            content: {
              pieceId: 'pawn',
              player: 1
            }
          },
          '2,2': {
            content: null
          },
          '2,3': {
            content: null,
            promotion: 0
          },
          '3,0': {
            content: null,
            promotion: 1
          },
          '3,1': {
            content: {
              pieceId: 'knight',
              player: 1
            }
          },
          '3,2': {
            content: {
              pieceId: 'rook',
              player: 1
            }
          },
          '3,3': {
            content: null,
            promotion: 0
          }
        },
        orientation: {
          white: 3,
          black: 2
        }
      })
    }
  }

  await createDefinition(pnrkFormat, [squadChessAddress])

  const chessFormat = {
    Format: {
      name: 'Chess',
      components: [...squadChessCatalog],
      data: JSON.stringify({ // TODO implement this in the metastore Format type
        startingPosition: {
          '0,0': {
            content: {
              pieceId: 'rook',
              player: 1
            },
            promotion: 0
          },
          '1,0': {
            content: {
              pieceId: 'bishop',
              player: 1
            },
            promotion: 0
          },
          '2,0': {
            content: {
              pieceId: 'knight',
              player: 1
            },
            promotion: 0
          },
          '3,0': {
            content: {
              pieceId: 'king',
              player: 1
            },
            promotion: 0
          },
          '4,0': {
            content: {
              pieceId: 'queen',
              player: 1
            },
            promotion: 0
          },
          '5,0': {
            content: {
              pieceId: 'knight',
              player: 1
            },
            promotion: 0
          },
          '6,0': {
            content: {
              pieceId: 'rook',
              player: 1
            },
            promotion: 0
          },
          '7,0': {
            content: {
              pieceId: 'rook',
              player: 1
            },
            promotion: 0
          },
          '0,1': {
            content: {
              pieceId: 'pawn',
              player: 1
            }
          },
          '1,1': {
            content: {
              pieceId: 'pawn',
              player: 1
            }
          },
          '2,1': {
            content: {
              pieceId: 'pawn',
              player: 1
            }
          },
          '3,1': {
            content: {
              pieceId: 'pawn',
              player: 1
            }
          },
          '4,1': {
            content: {
              pieceId: 'pawn',
              player: 1
            }
          },
          '5,1': {
            content: {
              pieceId: 'pawn',
              player: 1
            }
          },
          '6,1': {
            content: {
              pieceId: 'pawn',
              player: 1
            }
          },
          '7,1': {
            content: {
              pieceId: 'pawn',
              player: 1
            }
          },
          '0,2': {
            content: null
          },
          '1,2': {
            content: null
          },
          '2,2': {
            content: null
          },
          '3,2': {
            content: null
          },
          '4,2': {
            content: null
          },
          '5,2': {
            content: null
          },
          '6,2': {
            content: null
          },
          '7,2': {
            content: null
          },
          '0,3': {
            content: null
          },
          '1,3': {
            content: null
          },
          '2,3': {
            content: null
          },
          '3,3': {
            content: null
          },
          '4,3': {
            content: null
          },
          '5,3': {
            content: null
          },
          '6,3': {
            content: null
          },
          '7,3': {
            content: null
          },
          '0,4': {
            content: null
          },
          '1,4': {
            content: null
          },
          '2,4': {
            content: null
          },
          '3,4': {
            content: null
          },
          '4,4': {
            content: null
          },
          '5,4': {
            content: null
          },
          '6,4': {
            content: null
          },
          '7,4': {
            content: null
          },
          '0,5': {
            content: null
          },
          '1,5': {
            content: null
          },
          '2,5': {
            content: null
          },
          '3,5': {
            content: null
          },
          '4,5': {
            content: null
          },
          '5,5': {
            content: null
          },
          '6,5': {
            content: null
          },
          '7,5': {
            content: null
          },
          '0,6': {
            content: {
              pieceId: 'pawn',
              player: 0
            }
          },
          '1,6': {
            content: {
              pieceId: 'pawn',
              player: 0
            }
          },
          '2,6': {
            content: {
              pieceId: 'pawn',
              player: 0
            }
          },
          '3,6': {
            content: {
              pieceId: 'pawn',
              player: 0
            }
          },
          '4,6': {
            content: {
              pieceId: 'pawn',
              player: 0
            }
          },
          '5,6': {
            content: {
              pieceId: 'pawn',
              player: 0
            }
          },
          '6,6': {
            content: {
              pieceId: 'pawn',
              player: 0
            }
          },
          '7,6': {
            content: {
              pieceId: 'pawn',
              player: 0
            }
          },
          '0,7': {
            content: {
              pieceId: 'rook',
              player: 0
            },
            promotion: 1
          },
          '1,7': {
            content: {
              pieceId: 'rook',
              player: 0
            },
            promotion: 1
          },
          '2,7': {
            content: {
              pieceId: 'knight',
              player: 0
            },
            promotion: 1
          },
          '3,7': {
            content: {
              pieceId: 'rook',
              player: 0
            },
            promotion: 1
          },
          '4,7': {
            content: {
              pieceId: 'king',
              player: 0
            },
            promotion: 1
          },
          '5,7': {
            content: {
              pieceId: 'knight',
              player: 0
            },
            promotion: 1
          },
          '6,7': {
            content: {
              pieceId: 'rook',
              player: 0
            },
            promotion: 1
          },
          '7,7': {
            content: {
              pieceId: 'rook',
              player: 0
            },
            promotion: 1
          }
        },
        orientation: {
          white: 2,
          black: 0
        }
      })
    }
  }

  await createDefinition(chessFormat, [squadChessAddress])
}

on('open', () => {
  console.log('connection open')
  main().then(() => {
    console.log('done')
    process.exit(0)
  })
})
