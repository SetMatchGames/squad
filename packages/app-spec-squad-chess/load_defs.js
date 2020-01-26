const { on, webSocketConnection, createDefinition, getCatalogAddresses } = require('@squad/sdk').metastore

webSocketConnection('ws://localhost:8888')

process.on('unhandledRejection', r => console.log(r));

async function main() {
  const rpsAddress = await createDefinition({
    Game: {
      name: "Roshambo",
      type_: "web-game-v0",
      data: JSON.stringify({
        url: "http://localhost:3001"
      })
    }
  })

  const rpsComponents = [{
    Component: {
      name: "Rock",
      data: JSON.stringify({
        winsAgainst: ["Scissors"],
        losesAgainst: ["Paper"]
      })
    }
  }, {
    Component: {
      name: "Paper",
      data: JSON.stringify({
        winsAgainst: ["Rock"],
        losesAgainst: ["Scissors"]
      })
    }
  }, {
    Component: {
      name: "Scissors",
      data: JSON.stringify({
        winsAgainst: ["Paper"],
        losesAgainst: ["Rock"]
      })
    }
  }]

  rpsComponents.forEach(async (definition) => {
    await createDefinition(definition, [rpsAddress])
  })

  const rpsCatalog = await getCatalogAddresses("Component", `${rpsAddress} Component Catalog`)

  const rpsStandard = {
    Format: {
      name: 'Standard',
      components: [ ...rpsCatalog ],
    }
  }

  await createDefinition(rpsStandard, [rpsAddress])

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
            pieceId: 'pawn',
            player: 0
          },
          '0,1': null,
          '0,2': null,
          '0,3': {
            pieceId: 'knight',
            player: 0
          },
          '1,0': {
            pieceId: 'rook',
            player: 0
          },
          '1,1': {
            pieceId: 'king',
            player: 0
          },
          '1,2': null,
          '1,3': {
            pieceId: 'king',
            player: 1
          },
          '2,0': null,
          '2,1': {
            pieceId: 'pawn',
            player: 1
          },
          '2,2': null,
          '2,3': null,
          '3,0': null,
          '3,1': {
            pieceId: 'knight',
            player: 1
          },
          '3,2': {
            pieceId: 'rook',
            player: 1
          },
          '3,3': null
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
