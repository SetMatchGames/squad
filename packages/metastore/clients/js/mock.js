const WebSocketServer = require('rpc-websockets').Server
const WebSocket = require('rpc-websockets').Client
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

const MOCK_ZOMES = {
  "definitions": {
    create_definition: ({definition}) => {
      const defString = JSON.stringify(definition)
      const address = entryAddress(definition)
      DEFINITIONS[address] = definition
      var typeIdentified = false
      for (var type_ in CATALOGS) {
        // for each type of definition we have catalogs for
        // add it to that catalog if the definition is of that type
        // if there is no catalog, it's an invalid type
        if (type_ in definition) {
          // deffinitions use their rust type as the top level key
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
    },
    get_definition: ({address}) => {
      const definition = DEFINITIONS[address]
      if (!definition) {
        throw new Error(`No definition found for address ${address}`)
      }
      return definition
    },
    get_entry_address: ({entry}) => entryAddress(entry),
    get_catalog_links: ({catalog_type, catalog_name}) => {
      if (!(catalog_type in CATALOGS)) {
        throw new Error(`Invalid type ${catalog_type}`)
      }
      const catalog = CATALOGS[catalog_type][`${catalog_type} Catalog`]
      if (!catalog) {
        throw new Error(`${catalog_type} Catalog not found`)
      }
      return catalog
    },
    get_all_definitions_of_type: ({catalog_type}) => {
      return MOCK_ZOMES.definitions.get_definitions_from_catalog({
        catalog_type: catalog_type,
        catalog_name: `${catalog_type} Catalog`
      })
    },
    get_definitions_from_catalog: ({catalog_type, catalog_name}) => {
      const catalog = MOCK_ZOMES.definitions.get_catalog_links(
        {catalog_type, catalog_name}
      )
      return catalog.map(address => {
        return MOCK_ZOMES.definitions.get_definition({address})
      })
    }
  }
}

const MOCK_INSTANCE_ID = conf("MOCK_INSTANCE_ID", "mock_instance_id")

function mockConnection() {
  const port = conf("METASTORE_PORT", 8888)
  const host = conf("METASTORE_HOST", "localhost")
  const server = new WebSocketServer({port, host})
  mockMetastore.server = server

  server.register('info/instances', async function (params) {
    return [{id: MOCK_INSTANCE_ID}]
  })

  server.register('call', async function (
    {instance_id, zome, function: method, args} ) {
    /*
     * Mock implimentations of zome functions are registered in the
     * MOCK_ZOMES object above.
     * This function looks up the zome and function and calls it.
     **/
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
  })

  mockMetastore.client = new WebSocket(`ws://${host}:${port}`)
  return mockMetastore.client
}

module.exports = {
  mockConnection
}
