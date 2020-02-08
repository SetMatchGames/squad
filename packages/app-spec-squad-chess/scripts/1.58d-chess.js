const {
  on,
  webSocketConnection,
  createDefinition,
  getCatalogAddresses
} = require('@squad/sdk').metastore

const gameAddress = require('../src/settings.json').gameAddress

webSocketConnection('ws://localhost:8888')

process.on('unhandledRejection', r => console.error(r))

async function main () {
  const startingPosition = {
    '0,0': {
      content: { pieceId: 'king', player: 1 },
      promotion: 0
    },
    '1,0': {
      content: { pieceId: 'queen', player: 1 },
      promotion: 0
    },
    '1,1': {
      content: { pieceId: 'rook', player: 1 }
    },
    '2,0': {
      content: { pieceId: 'bishop', player: 1 },
      promotion: 0
    },
    '2,2': {
        content: { pieceId: 'pawn', player: 1 }
    },
    '3,0': {
        content: { pieceId: 'pawn', player: 1 },
        promotion: 0
    },
    '3,1': {
        content: { pieceId: 'knight', player: 1 }
    },
    '3,2': { content: null },
    '3,3': { content: null },
    '4,0': { content: null, promotion: 0 },
    '4,4': { content: null },
    '5,0': { content: null, promotion: 0 },
    '5,1': { content: null },
    '5,4': { content: null },
    '5,5': {
      content: { pieceId: 'pawn', player: 0 }
    },
    '6,0': { content: null, promotion: 0 },
    '6,2': { content: null },
    '6,4': {
      content: { pieceId: 'knight', player: 0 }
    },
    '6,6': {
      content: { pieceId: 'rook', player: 0 }
    },
    '7,0': { content: null, promotion: [1, 0] },
    '7,1': { content: null, promotion: 1 },
    '7,2': { content: null, promotion: 1 },
    '7,3': { content: null, promotion: 1 },
    '7,4': {
      content: { pieceId: 'pawn', player: 0 },
      promotion: 1
    },
    '7,5': {
      content: { pieceId: 'bishop', player: 0 },
      promotion: 1
    },
    '7,6': {
      content: { pieceId: 'queen', player: 0 },
      promotion: 1
    },
    '7,7': {
      content: { pieceId: 'king', player: 0 },
      promotion: 1
    }
  }

  const squadChessCatalog = await getCatalogAddresses(
    'Component',
    `${gameAddress} Component Catalog`
  )

  const _158dFormat = {
    Format: {
      name: '1.58d Chess',
      components: [...squadChessCatalog],
      data: JSON.stringify({
        startingPosition,
        orientation: {
          white: 2, black: 3
        }
      })
    }
  }

  await createDefinition(_158dFormat, [gameAddress])
}

on('open', () => {
  main().then(() => {
    console.log('done')
    process.exit(0)
  })
})
