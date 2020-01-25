const fs = require('fs')
const WSServer = require('rpc-websockets').Server
const crypto = require('crypto')
const toml = require('@iarna/toml')

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

let DEFINITIONS = {}

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

const host = conf("MOCK_METASTORE_PORT", "8888")
const port = conf("MOCK_METASTORE_HOST", "localhost")

const server = new WSServer({
  port: host,
  host: port
})

console.log(`Mock Metastore Listening on ws://${host}:${port}`)

server.register('info/instances', () => {
  return [{id: MOCK_INSTANCE_ID}]
})

const readDefinitions = (path) => {
  const data = fs.readFileSync(path, 'utf8')
  return toml.parse(data)
}

const writeDefinitions = (path, defs) => {
  const data = toml.stringify(defs)
  fs.writeFileSync(path, data, 'utf8')
}

server.register('call', ({instance_id, zome, function: method, args}) => {
  if (instance_id !== MOCK_INSTANCE_ID) {
    throw new Error(
      `Expected instance_id to be ${MOCK_INSTANCE_ID}, but got ${instance_id}`
    )
  }
  // for the mock, and in order to enable manual editing of definitions
  // we reload the definitions from the filesystem on every call, later
  // we will write the file to the filesystem
  const definitionsPath = conf(
    "MOCK_METASTORE_DEFINITIONS_PATH",
    "./definitions.toml"
  )
  // TODO keep an eye out for problems caused by this being shared mutable state
  DEFINITIONS = readDefinitions(definitionsPath)
  const mock_zome = MOCK_ZOMES[zome]
  if (!mock_zome) { throw new Error(`Unknown zome ${zome}`) }
  const zome_function = mock_zome[method]
  if (!zome_function) { throw new Error(`Unknown function ${zome}/${method}`) }
  const result = {Ok: zome_function(args)}
  writeDefinitions(definitionsPath, DEFINITIONS)
  return JSON.stringify(result)
})
