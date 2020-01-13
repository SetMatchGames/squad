const crypto = require('crypto')

const mockMetastore = {}

function conf(name, default_value) {
  var value = process.env[name]
  if (value === undefined) {
    value = default_value
  }
  if (value === undefined) {
    throw new Error(`Required configuration "${name}" not found.`)
  }
  return value
}

const DEFINITIONS = {}

const CATALOGS = {
  // { CatalogType: {CatalogName: [address]}}
  Game: {"Game Catalog": []},
  Format: {"Format Catalog": []},
  Component: {"Component Catalog": []}
}

function entryAddress(entry) {
  return crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex')
}

const createDefinition = ({definition, games = []}) => {
  const defString = JSON.stringify(definition)
  const address = entryAddress(definition)
  DEFINITIONS[address] = definition
  var typeIdentified = false
  for (var type_ in CATALOGS) {
    // for each type of definition we have catalogs for
    // add it to that catalog if the definition is of that type
    // if there is no catalog, it's an invalid type
    if (type_ in definition) {
      // Adding definition to the proper game catalogs
      if (type_ !== 'Game') {
        if (games.length === 0) { throw new Error(
          `Invalid game addresses for ${type_}: ${games}`
        )}
        games.forEach(gameAddress => {
          const catalogName = `${gameAddress} ${type_} Catalog`
          if (CATALOGS[type_][catalogName]) {
            CATALOGS[type_][catalogName].push(address)
          } else {
            CATALOGS[type_][catalogName] = [address]
          }
        })
      }
      // definitions use their rust type as the top level key
      // like {Game: {...}} or {Format: {...}}
      if (!CATALOGS[type_][`${type_} Catalog`].includes(address)) {
        CATALOGS[type_][`${type_} Catalog`].push(address)
      }
      typeIdentified = true
      break
    }
  }
  if (!typeIdentified) {
    throw new Error(`Invalid definition type ${Object.keys(definition)}`)
  }
  return address
}

const getDefinition = ({address}) => {
  const definition = DEFINITIONS[address]
  if (!definition) {
    throw new Error(`No definition found for address ${address}`)
  }
  return definition
}

const getEntryAddress = ({entry}) => entryAddress(entry)

const getCatalogLinks = ({catalog_type, catalog_name}) => {
  if (!(catalog_type in CATALOGS)) {
    throw new Error(`Invalid type ${catalog_type}`)
  }
  const catalog = CATALOGS[catalog_type][catalog_name]
  if (!catalog) {
    throw new Error(`${catalog_type}/${catalog_name} not found`)
  }
  return catalog
}

const getAllDefinitionsOfType =  ({catalog_type}) => {
  return MOCK_ZOMES.definitions.get_definitions_from_catalog({
    catalog_type: catalog_type,
    catalog_name: `${catalog_type} Catalog`
  })
}

const getDefinitionsFromCatalog = ({catalog_type, catalog_name}) => {
  const catalog = MOCK_ZOMES.definitions.get_catalog_links(
    {catalog_type, catalog_name}
  )
  return catalog.map(address => {
    return MOCK_ZOMES.definitions.get_definition({address})
  })
}

const MOCK_ZOMES = {
  "definitions": {
    create_definition: createDefinition,
    get_definition: getDefinition,
    get_entry_address: getEntryAddress,
    get_catalog_links: getCatalogLinks,
    get_all_definitions_of_type: getAllDefinitionsOfType,
    get_definitions_from_catalog: getDefinitionsFromCatalog
  }
}

const MOCK_INSTANCE_ID = conf("MOCK_INSTANCE_ID", "mock_instance_id")

function wsCall(method, params) {
  switch (method) {
    case 'info/instances':
      return [{id: MOCK_INSTANCE_ID}]
      break;
    case  'call':
      let {instance_id, zome, function: method, args} = params
      if (instance_id !== MOCK_INSTANCE_ID) {
        throw new Error(
          `Expected instance_id to be ${MOCK_INSTANCE_ID}, but got ${instance_id}`
        )
      }
      const mock_zome = MOCK_ZOMES[zome]
      if (!mock_zome) { throw new Error(`Unknown zome ${zome}`) }
      const zome_function = mock_zome[method]
      if (!zome_function) { throw new Error(`Unknown function ${zome}/${method}`) }
      const result = {Ok: zome_function(args)}
      return JSON.stringify(result)
      break
  }
}

const rpsAddress = createDefinition({ definition: {
  Game: {
    name: "App Spec",
    type_: "web-game-v0",
    data: JSON.stringify({
      url: "http://localhost:3001"
    })
  }
}})

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

rpsComponents.forEach(definition => {
  createDefinition({ definition, games: [rpsAddress] })
})

createDefinition({
  definition: {
    Format: {
      name: 'Standard',
      components: [ ...CATALOGS.Component[`${rpsAddress} Component Catalog`] ]
    }
  },
  games: [rpsAddress]
})

const squadChessAddress = createDefinition({ definition: {
  Game: {
    name: "Squad Chess",
    type_: "web-game-v0",
    data: JSON.stringify({
      url: "http://localhost:3001"
    })
  }
}})

console.log(
  "Squad Chess Address, update settings if this changes",
  squadChessAddress
)

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
          promotion: [ 'any' ]
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

squadChessComponents.forEach(definition => {
  createDefinition({ definition, games: [squadChessAddress] })
})

createDefinition({
  definition: {
    Format: {
      name: 'PNRK',
      components: [ ...CATALOGS.Component[`${squadChessAddress} Component Catalog`] ],
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
  },
  games: [squadChessAddress]
})

module.exports = {
  mockConnection: () => { return { call: wsCall } }
}
