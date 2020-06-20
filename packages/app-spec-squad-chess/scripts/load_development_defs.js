/* global process require */

const { createDefinition } = require('@squad/sdk').metastore

process.on('unhandledRejection', r => console.log(r))

async function main () {
  const squadChess = {
    Game: {
      name: 'Squad Chess',
      type_: 'web-game-v0',
      data: JSON.stringify({
        url: 'http://localhost:3001'
      })
    }
  }

  const squadChessAddress = await createDefinition(squadChess)

  const squadChessComponents = [{
    Component: {
      name: 'Rook',
      data: JSON.stringify({
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
      })
    }
  }, {
    Component: {
      name: 'King',
      data: JSON.stringify({
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
      })
    }
  }, {
    Component: {
      name: 'Pawn',
      data: JSON.stringify({
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
      })
    }
  }, {
    Component: {
      name: 'Knight',
      data: JSON.stringify({
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
      })
    }
  }, {
    Component: {
      name: 'Bishop',
      data: JSON.stringify({
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
      })
    }
  }, {
    Component: {
      name: 'Queen',
      data: JSON.stringify({
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
      })
    }
  }, {
    Component: {
      name: 'Night King',
      data: '{"mechanics":{"move":[{"offset":[1,1],"steps":1},{"offset":[1,-1],"steps":1},{"offset":[-1,-1],"steps":1},{"offset":[-1,1],"steps":1},{"offset":[0,1],"steps":1},{"offset":[0,-1],"steps":1},{"offset":[1,0],"steps":1},{"offset":[-1,0],"steps":1},{"offset":[1,2],"steps":1},{"offset":[1,-2],"steps":1},{"offset":[2,1],"steps":1},{"offset":[2,-1],"steps":1},{"offset":[-1,2],"steps":1},{"offset":[-1,-2],"steps":1},{"offset":[-2,1],"steps":1},{"offset":[-2,-1],"steps":1}],"capture":[{"offset":[1,1],"steps":1},{"offset":[1,-1],"steps":1},{"offset":[-1,1],"steps":1},{"offset":[-1,-1],"steps":1},{"offset":[0,1],"steps":1},{"offset":[0,-1],"steps":1},{"offset":[1,0],"steps":1},{"offset":[-1,0],"steps":1},{"offset":[1,2],"steps":1},{"offset":[1,-2],"steps":1},{"offset":[2,1],"steps":1},{"offset":[2,-1],"steps":1},{"offset":[-1,2],"steps":1},{"offset":[-1,-2],"steps":1},{"offset":[-2,1],"steps":1},{"offset":[-2,-1],"steps":1}]},"admechanics":{},"king":true,"graphics":{"local":{"white":"../img/chesspieces/flaticon-gaming/w-sword.png","black":"../img/chesspieces/flaticon-gaming/b-sword.png"}}}'
    }
  }]

  const componentAddresses = {}

  const promises = squadChessComponents.map(async (definition) => {
    const address = await createDefinition(definition, [squadChessAddress])
    componentAddresses[definition.Component.name] = address
    console.log('creating definition', definition, address)
  })

  await Promise.all(promises)

  const chessFormat = {
    Format: {
      name: 'Chess',
      components: [
        componentAddresses.Pawn,
        componentAddresses.Rook,
        componentAddresses.Bishop,
        componentAddresses.Knight,
        componentAddresses.Queen,
        componentAddresses.King
      ],
      data: '{"startingPosition":{"0,0":{"content":{"pieceId":"5bb997a86edd4498863841a78dd8aaf6afb4e409f912b14abd06d4cfdff66393","player":1},"promotion":0},"0,1":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"0,2":{"content":null},"0,3":{"content":null},"0,4":{"content":null},"0,5":{"content":null},"0,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"0,7":{"content":{"pieceId":"5bb997a86edd4498863841a78dd8aaf6afb4e409f912b14abd06d4cfdff66393","player":0},"promotion":1},"1,0":{"content":{"pieceId":"73d86593b34ff58458be603db6cc9e71a162eb22a92222eb9024ca229674a0b0","player":1},"promotion":0},"1,1":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"1,2":{"content":null},"1,3":{"content":null},"1,4":{"content":null},"1,5":{"content":null},"1,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"1,7":{"content":{"pieceId":"73d86593b34ff58458be603db6cc9e71a162eb22a92222eb9024ca229674a0b0","player":0},"promotion":1},"2,0":{"content":{"pieceId":"c859fb4af46e35b010a7a9668266e1729dcd6baa12c0ba2bcca03ced24e0d495","player":1},"promotion":0},"2,1":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"2,2":{"content":null},"2,3":{"content":null},"2,4":{"content":null},"2,5":{"content":null},"2,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"2,7":{"content":{"pieceId":"c859fb4af46e35b010a7a9668266e1729dcd6baa12c0ba2bcca03ced24e0d495","player":0},"promotion":1},"3,0":{"content":{"pieceId":"775c16ba93f83d5955041dd828467a49675a4779917b906ffda0683afac7cc52","player":1},"promotion":0},"3,1":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"3,2":{"content":null},"3,3":{"content":null},"3,4":{"content":null},"3,5":{"content":null},"3,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"3,7":{"content":{"pieceId":"775c16ba93f83d5955041dd828467a49675a4779917b906ffda0683afac7cc52","player":0},"promotion":1},"4,0":{"content":{"pieceId":"ec9b5c716d2afec3340f9695501b2ac922dac77ebae52e4a0cba545185de4299","player":1},"promotion":0},"4,1":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"4,2":{"content":null},"4,3":{"content":null},"4,4":{"content":null},"4,5":{"content":null},"4,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"4,7":{"content":{"pieceId":"ec9b5c716d2afec3340f9695501b2ac922dac77ebae52e4a0cba545185de4299","player":0},"promotion":1},"5,0":{"content":{"pieceId":"c859fb4af46e35b010a7a9668266e1729dcd6baa12c0ba2bcca03ced24e0d495","player":1},"promotion":0},"5,1":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"5,2":{"content":null},"5,3":{"content":null},"5,4":{"content":null},"5,5":{"content":null},"5,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"5,7":{"content":{"pieceId":"c859fb4af46e35b010a7a9668266e1729dcd6baa12c0ba2bcca03ced24e0d495","player":0},"promotion":1},"6,0":{"content":{"pieceId":"73d86593b34ff58458be603db6cc9e71a162eb22a92222eb9024ca229674a0b0","player":1},"promotion":0},"6,1":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"6,2":{"content":null},"6,3":{"content":null},"6,4":{"content":null},"6,5":{"content":null},"6,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"6,7":{"content":{"pieceId":"73d86593b34ff58458be603db6cc9e71a162eb22a92222eb9024ca229674a0b0","player":0},"promotion":1},"7,0":{"content":{"pieceId":"5bb997a86edd4498863841a78dd8aaf6afb4e409f912b14abd06d4cfdff66393","player":1},"promotion":0},"7,1":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"7,2":{"content":null},"7,3":{"content":null},"7,4":{"content":null},"7,5":{"content":null},"7,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"7,7":{"content":{"pieceId":"5bb997a86edd4498863841a78dd8aaf6afb4e409f912b14abd06d4cfdff66393","player":0},"promotion":1}},"orientation":{"white":2,"black":0}}'
    }
  }

  await createDefinition(chessFormat, [squadChessAddress])

  const chessRBKNRNBQFormat = {
    Format: {
      name: 'Chess RBKNRNBQ',
      components: [
        componentAddresses.Pawn,
        componentAddresses.Rook,
        componentAddresses.Bishop,
        componentAddresses.Knight,
        componentAddresses.Queen,
        componentAddresses.King
      ],
      data: '{"startingPosition":{"0,0":{"content":{"pieceId":"775c16ba93f83d5955041dd828467a49675a4779917b906ffda0683afac7cc52","player":1},"promotion":0},"0,1":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"0,2":{"content":null},"0,3":{"content":null},"0,4":{"content":null},"0,5":{"content":null},"0,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"0,7":{"content":{"pieceId":"775c16ba93f83d5955041dd828467a49675a4779917b906ffda0683afac7cc52","player":0},"promotion":1},"1,0":{"content":{"pieceId":"c859fb4af46e35b010a7a9668266e1729dcd6baa12c0ba2bcca03ced24e0d495","player":1},"promotion":0},"1,1":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"1,2":{"content":null},"1,3":{"content":null},"1,4":{"content":null},"1,5":{"content":null},"1,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"1,7":{"content":{"pieceId":"c859fb4af46e35b010a7a9668266e1729dcd6baa12c0ba2bcca03ced24e0d495","player":0},"promotion":1},"2,0":{"content":{"pieceId":"73d86593b34ff58458be603db6cc9e71a162eb22a92222eb9024ca229674a0b0","player":1},"promotion":0},"2,1":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"2,2":{"content":null},"2,3":{"content":null},"2,4":{"content":null},"2,5":{"content":null},"2,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"2,7":{"content":{"pieceId":"73d86593b34ff58458be603db6cc9e71a162eb22a92222eb9024ca229674a0b0","player":0},"promotion":1},"3,0":{"content":{"pieceId":"5bb997a86edd4498863841a78dd8aaf6afb4e409f912b14abd06d4cfdff66393","player":1},"promotion":0},"3,1":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"3,2":{"content":null},"3,3":{"content":null},"3,4":{"content":null},"3,5":{"content":null},"3,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"3,7":{"content":{"pieceId":"5bb997a86edd4498863841a78dd8aaf6afb4e409f912b14abd06d4cfdff66393","player":0},"promotion":1},"4,0":{"content":{"pieceId":"73d86593b34ff58458be603db6cc9e71a162eb22a92222eb9024ca229674a0b0","player":1},"promotion":0},"4,1":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"4,2":{"content":null},"4,3":{"content":null},"4,4":{"content":null},"4,5":{"content":null},"4,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"4,7":{"content":{"pieceId":"73d86593b34ff58458be603db6cc9e71a162eb22a92222eb9024ca229674a0b0","player":0},"promotion":1},"5,0":{"content":{"pieceId":"ec9b5c716d2afec3340f9695501b2ac922dac77ebae52e4a0cba545185de4299","player":1},"promotion":0},"5,1":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"5,2":{"content":null},"5,3":{"content":null},"5,4":{"content":null},"5,5":{"content":null},"5,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"5,7":{"content":{"pieceId":"ec9b5c716d2afec3340f9695501b2ac922dac77ebae52e4a0cba545185de4299","player":0},"promotion":1},"6,0":{"content":{"pieceId":"c859fb4af46e35b010a7a9668266e1729dcd6baa12c0ba2bcca03ced24e0d495","player":1},"promotion":0},"6,1":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"6,2":{"content":null},"6,3":{"content":null},"6,4":{"content":null},"6,5":{"content":null},"6,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"6,7":{"content":{"pieceId":"c859fb4af46e35b010a7a9668266e1729dcd6baa12c0ba2bcca03ced24e0d495","player":0},"promotion":1},"7,0":{"content":{"pieceId":"5bb997a86edd4498863841a78dd8aaf6afb4e409f912b14abd06d4cfdff66393","player":1},"promotion":0},"7,1":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"7,2":{"content":null},"7,3":{"content":null},"7,4":{"content":null},"7,5":{"content":null},"7,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"7,7":{"content":{"pieceId":"5bb997a86edd4498863841a78dd8aaf6afb4e409f912b14abd06d4cfdff66393","player":0},"promotion":1}},"orientation":{"white":2,"black":0}}'
    }
  }

  await createDefinition(chessRBKNRNBQFormat, [squadChessAddress])

  const ExhibitionChess = {
    Format: {
      name: 'Exhibition Chess',
      components: [
        componentAddresses.Pawn,
        componentAddresses.Rook,
        componentAddresses.Bishop,
        componentAddresses.Knight,
        componentAddresses.Queen,
        componentAddresses['Night King']
      ],
      data: '{"startingPosition":{"0,3":{"content":{"pieceId":"5bb997a86edd4498863841a78dd8aaf6afb4e409f912b14abd06d4cfdff66393","player":0}},"0,4":{"content":{"pieceId":"73d86593b34ff58458be603db6cc9e71a162eb22a92222eb9024ca229674a0b0","player":0}},"0,5":{"content":{"pieceId":"ac98c0958179e2ae7e4080c0ef00ccd3a16ad09f769b76319d62c552ca24c437","player":0}},"1,3":{"content":null},"1,4":{"content":null},"1,5":{"content":null},"2,3":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"2,4":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"2,5":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"3,0":{"content":{"pieceId":"5bb997a86edd4498863841a78dd8aaf6afb4e409f912b14abd06d4cfdff66393","player":1}},"3,1":{"content":null},"3,2":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"3,3":{"content":null},"3,4":{"content":null},"3,5":{"content":null},"4,0":{"content":{"pieceId":"73d86593b34ff58458be603db6cc9e71a162eb22a92222eb9024ca229674a0b0","player":1}},"4,1":{"content":null},"4,2":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"4,3":{"content":null},"4,4":{"content":null},"4,5":{"content":null},"5,0":{"content":{"pieceId":"ac98c0958179e2ae7e4080c0ef00ccd3a16ad09f769b76319d62c552ca24c437","player":1}},"5,1":{"content":null},"5,2":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"5,3":{"content":null},"5,4":{"content":null},"5,5":{"content":null},"6,0":{"content":{"pieceId":"775c16ba93f83d5955041dd828467a49675a4779917b906ffda0683afac7cc52","player":1}},"6,1":{"content":null},"6,2":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"6,3":{"content":null},"6,4":{"content":null},"6,5":{"content":null},"7,0":{"content":{"pieceId":"c859fb4af46e35b010a7a9668266e1729dcd6baa12c0ba2bcca03ced24e0d495","player":1}},"7,1":{"content":null},"7,2":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":1}},"7,3":{"content":null,"promotion":0},"7,4":{"content":null,"promotion":0},"7,5":{"content":null,"promotion":0},"0,6":{"content":{"pieceId":"775c16ba93f83d5955041dd828467a49675a4779917b906ffda0683afac7cc52","player":0}},"0,7":{"content":{"pieceId":"c859fb4af46e35b010a7a9668266e1729dcd6baa12c0ba2bcca03ced24e0d495","player":0}},"1,6":{"content":null},"1,7":{"content":null},"2,6":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"2,7":{"content":{"pieceId":"e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36","player":0}},"3,6":{"content":null},"3,7":{"content":null,"promotion":1},"4,6":{"content":null},"4,7":{"content":null,"promotion":1},"5,6":{"content":null},"5,7":{"content":null,"promotion":1},"6,6":{"content":null},"6,7":{"content":null,"promotion":1},"7,6":{"content":null,"promotion":0}},"orientation":{"white":"3","black":"0"}}'    
    }
  }

  await createDefinition(ExhibitionChess, [squadChess])

  return [...squadChessComponents, squadChess, chessFormat, chessRBKNRNBQFormat, ExhibitionChess]
}

module.exports = main
