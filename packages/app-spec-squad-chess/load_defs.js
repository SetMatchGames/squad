const { on, webSocketConnection, createDefinition, getCatalogAddresses } = require('@squad/sdk').metastore

webSocketConnection('ws://localhost:8888')

process.on('unhandledRejection', r => console.log(r));

async function main() {

  const squadChessAddress = await createDefinition({
    Game: {
      name: "Squad Chess",
      type_: "web-game-v0",
      data: JSON.stringify({
        url: "http://localhost:3001"
      })
    }
  })

  const squadChessComponents = [{
    Component: {
      name: "Rook",
      data: JSON.stringify({
        rook: {
          mechanics: {
            move: [
              { offset: [0,1], steps: 100 },
              { offset: [0,-1], steps: 100 },
              { offset: [1,0], steps: 100 },
              { offset: [-1,0], steps: 100 }
            ],
            capture: [
              { offset: [0,1], steps: 100 },
              { offset: [0,-1], steps: 100 },
              { offset: [1,0], steps: 100 },
              { offset: [-1,0], steps: 100 }
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
      name: "King",
      data: JSON.stringify({
        king: {
          king: true,
          mechanics: {
            move: [
              { offset: [0,1], steps: 1 },
              { offset: [0,-1], steps: 1 },
              { offset: [1,0], steps: 1 },
              { offset: [-1,0], steps: 1 },
              { offset: [1,1], steps: 1 },
              { offset: [-1,-1], steps: 1 },
              { offset: [1,-1], steps: 1 },
              { offset: [-1,1], steps: 1 }
            ],
            capture: [
              { offset: [0,1], steps: 1 },
              { offset: [0,-1], steps: 1 },
              { offset: [1,0], steps: 1 },
              { offset: [-1,0], steps: 1 },
              { offset: [1,1], steps: 1 },
              { offset: [-1,-1], steps: 1 },
              { offset: [1,-1], steps: 1 },
              { offset: [-1,1], steps: 1 }
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
      name: "Pawn",
      data: JSON.stringify({
        pawn: {
          mechanics: {
            move: [
              { offset: [0,1], steps: 1 }
            ],
            capture: [
              { offset: [1,1], steps: 1 },
              { offset: [-1,1], steps: 1 }
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
      name: "Knight",
      data: JSON.stringify({
        knight: {
          mechanics: {
            move: [
              { offset: [2,1], steps: 1 },
              { offset: [1,2], steps: 1 },
              { offset: [-2,1], steps: 1 },
              { offset: [-1,2], steps: 1 },
              { offset: [1,-2], steps: 1 },
              { offset: [2,-1], steps: 1 },
              { offset: [-2,-1], steps: 1 },
              { offset: [-1,-2], steps: 1 }
            ],
            capture: [
              { offset: [2,1], steps: 1 },
              { offset: [1,2], steps: 1 },
              { offset: [-2,1], steps: 1 },
              { offset: [-1,2], steps: 1 },
              { offset: [1,-2], steps: 1 },
              { offset: [2,-1], steps: 1 },
              { offset: [-2,-1], steps: 1 },
              { offset: [-1,-2], steps: 1 }
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
  }]

  squadChessComponents.forEach(async (definition) => {
    await createDefinition(definition, [squadChessAddress])
  })

  const squadChessCatalog = await getCatalogAddresses("Component", `${squadChessAddress} Component Catalog`)

  const pnrkFormat = {
    Format: {
      name: 'PNRK',
      components: [ ...squadChessCatalog ],
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
}

on("open", () => {
  main().then(() => {
    console.log("done")
    process.exit(0)
  })
})
