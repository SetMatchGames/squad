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
        games.forEach(address => {
          const catalogName = `${address} ${type_} Catalog`
          let catalog = CATALOGS[type_][catalogName]
          if (catalog) {
            catalog.push(address)
          } else {
            catalog = [address]
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
  const catalog = CATALOGS[catalog_type][`${catalog_type} Catalog`]
  if (!catalog) {
    throw new Error(`${catalog_type} Catalog not found`)
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
      break;
  }
}

const gameAddress = createDefinition({ definition: {
  Game: {
    name: "App Spec",
    type_: "web-game-v0",
    data: JSON.stringify({
      url: "http://localhost:3001"
    })
  }
}})

const components = [{ 
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

components.forEach(definition => {
  createDefinition({ definition, games: [gameAddress] })
})

createDefinition({
  definition: { 
    Format: {
      name: 'Standard',
      components: [ ...CATALOGS.Component['Component Catalog'] ]
    }
  },
  games: [gameAddress]
})

module.exports = {
  mockConnection: () => { return { call: wsCall } }
}
