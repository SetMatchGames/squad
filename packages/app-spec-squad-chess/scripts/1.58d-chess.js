/* global require, process */

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
      content: { pieceId: 'c859fb4af46e35b010a7a9668266e1729dcd6baa12c0ba2bcca03ced24e0d495', player: 1 },
      promotion: 0
    },
    '1,0': {
      content: { pieceId: '775c16ba93f83d5955041dd828467a49675a4779917b906ffda0683afac7cc52', player: 1 },
      promotion: 0
    },
    '1,1': {
      content: { pieceId: '5bb997a86edd4498863841a78dd8aaf6afb4e409f912b14abd06d4cfdff66393', player: 1 }
    },
    '2,0': {
      content: { pieceId: 'c859fb4af46e35b010a7a9668266e1729dcd6baa12c0ba2bcca03ced24e0d495', player: 1 },
      promotion: 0
    },
    '2,2': {
      content: { pieceId: 'e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36', player: 1 }
    },
    '3,0': {
      content: { pieceId: 'e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36', player: 1 },
      promotion: 0
    },
    '3,1': {
      content: { pieceId: '73d86593b34ff58458be603db6cc9e71a162eb22a92222eb9024ca229674a0b0', player: 1 }
    },
    '3,2': { content: null },
    '3,3': { content: null },
    '4,0': { content: null, promotion: 0 },
    '4,4': { content: null },
    '5,0': { content: null, promotion: 0 },
    '5,1': { content: null },
    '5,4': { content: null },
    '5,5': {
      content: { pieceId: 'e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36', player: 0 }
    },
    '6,0': { content: null, promotion: 0 },
    '6,2': { content: null },
    '6,4': {
      content: { pieceId: '73d86593b34ff58458be603db6cc9e71a162eb22a92222eb9024ca229674a0b0', player: 0 }
    },
    '6,6': {
      content: { pieceId: '5bb997a86edd4498863841a78dd8aaf6afb4e409f912b14abd06d4cfdff66393', player: 0 }
    },
    '7,0': { content: null, promotion: [1, 0] },
    '7,1': { content: null, promotion: 1 },
    '7,2': { content: null, promotion: 1 },
    '7,3': { content: null, promotion: 1 },
    '7,4': {
      content: { pieceId: 'e9612e5ce2baa9b763477aaf717fbef4369f8a161c5764ce9f80d6e94a5c3c36', player: 0 },
      promotion: 1
    },
    '7,5': {
      content: { pieceId: 'c859fb4af46e35b010a7a9668266e1729dcd6baa12c0ba2bcca03ced24e0d495', player: 0 },
      promotion: 1
    },
    '7,6': {
      content: { pieceId: '775c16ba93f83d5955041dd828467a49675a4779917b906ffda0683afac7cc52', player: 0 },
      promotion: 1
    },
    '7,7': {
      content: { pieceId: 'c859fb4af46e35b010a7a9668266e1729dcd6baa12c0ba2bcca03ced24e0d495', player: 0 },
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
