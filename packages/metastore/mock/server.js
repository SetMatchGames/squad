/* global process require */

const fs = require('fs')
const WSServer = require('rpc-websockets').Server
const crypto = require('crypto')
const toml = require('@iarna/toml')

// HTTP Server for cloud health checks
const http = require('http')

const DEF_TYPES = ['Game', 'Component', 'Format']

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

function entryAddress (entry) {
  return crypto.createHash('sha256').update(JSON.stringify(entry)).digest('hex')
}

const definitionsPath = conf('MOCK_DEFINITIONS_PATH', './build/definitions')
const catalogsPath = conf('MOCK_CATALOGS_PATH', './build/catalogs')

console.log(`mock metastore configured ${definitionsPath}, ${catalogsPath}`)

// create definitions and catalogs folders if they don't exist
if (!fs.existsSync(catalogsPath)) {
  fs.mkdirSync(catalogsPath, { recursive: true })
}
if (!fs.existsSync(definitionsPath)) {
  fs.mkdirSync(definitionsPath, { recursive: true })
}

const readDefinition = (address) => {
  const data = fs.readFileSync(`${definitionsPath}/${address}.toml`, 'utf8')
  return toml.parse(data)
}

// Content addressed write
const writeDefinition = (definition) => {
  const address = entryAddress(definition)
  const data = toml.stringify(definition)
  const filename = `${definitionsPath}/${address}.toml`
  fs.writeFileSync(filename, data, 'utf8')
  return address
}

const addToCatalog = (catalogName, address) => {
  const catalogPath = `${catalogsPath}/${catalogName}`
  if (!fs.existsSync(catalogPath)) {
    fs.mkdirSync(catalogPath)
  }
  // write an empty file
  fs.closeSync(fs.openSync(`${catalogPath}/${address}`, 'w'))
}

const createDefinition = ({ definition, games = [] }) => {
  const address = writeDefinition(definition)
  var typeIdentified = false
  for (const i in DEF_TYPES) {
    const type_ = DEF_TYPES[i]
    // for each type of definition we have catalogs for
    // add it to that catalog if the definition is of that type
    // if there is no catalog, it's an invalid type
    if (type_ in definition) {
      // Adding definition to the proper game catalogs
      if (type_ !== 'Game') {
        if (games.length === 0) {
          throw new Error(
          `Invalid game addresses for ${type_}: ${games}`
          )
        }
        games.forEach(gameAddress => {
          const catalogName = `${gameAddress} ${type_} Catalog`
          addToCatalog(catalogName, address)
        })
      }
      // definitions use their rust type as the top level key
      // like {Game: {...}} or {Format: {...}}
      addToCatalog(`${type_} Catalog`, address)
      typeIdentified = true
      break
    }
  }
  if (!typeIdentified) {
    throw new Error(`Invalid definition type ${Object.keys(definition)}`)
  }
  return address
}

const getDefinition = ({ address }) => {
  const definition = readDefinition(address)
  if (!definition) {
    throw new Error(`No definition found for address ${address}`)
  }
  return definition
}

const getEntryAddress = ({ entry }) => entryAddress(entry)

const readCatalog = (name) => {
  const catalogPath = `${catalogsPath}/${name}`
  if (!fs.existsSync(catalogPath)) {
    console.error(`ERR: Catalog "${name}" not found`)
    throw new Error(`ERR: Catalog ${name} not found`)
  }
  const addresses = fs.readdirSync(catalogPath)
  return addresses
}

const getCatalogLinks = ({
  catalog_type: catalogType,
  catalog_name: catalogName
}) => {
  if (!DEF_TYPES.includes(catalogType)) {
    throw new Error(`Invalid type ${catalogType}`)
  }
  const catalog = readCatalog(catalogName)
  return catalog
}

const getAllDefinitionsOfType = ({ catalog_type: catalogType }) => {
  return MOCK_ZOMES.definitions.get_definitions_from_catalog({
    catalog_type: catalogType,
    catalog_name: `${catalogType} Catalog`
  })
}

const getDefinitionsFromCatalog = ({
  catalog_type: catalogType,
  catalog_name: catalogName
}) => {
  const catalog = MOCK_ZOMES.definitions.get_catalog_links(
    { catalog_type: catalogType, catalog_name: catalogName }
  )
  return catalog.map(address => {
    return MOCK_ZOMES.definitions.get_definition({ address })
  })
}

const MOCK_ZOMES = {
  definitions: {
    create_definition: createDefinition,
    get_definition: getDefinition,
    get_entry_address: getEntryAddress,
    get_catalog_links: getCatalogLinks,
    get_all_definitions_of_type: getAllDefinitionsOfType,
    get_definitions_from_catalog: getDefinitionsFromCatalog
  }
}

const MOCK_INSTANCE_ID = conf('MOCK_INSTANCE_ID', 'mock_instance_id')

console.log(`mock metastore configured MOCK_INSTANCE_ID=${MOCK_INSTANCE_ID}`)

const host = conf('MOCK_METASTORE_HOST', 'localhost')
const port = conf('PORT', '8888')

console.log(`mock metastore configured host=${host}, port=${port}`)

const server = http.createServer((req, res) => {
  console.log('health check server OK')
  res.end()
})
server.on('clientError', (err, socket) => {
  console.log('health check server ERROR', err)
  socket.end('HTTP/1.1 400 Bad Request\r\n\r\n')
})
server.listen(process.env.PORT)
console.log(`health check server listening on port ${process.env.PORT}`)

const wsServer = new WSServer({ server })
console.log(`mock metastore Listening on ${host}:${port}`)

wsServer.register('info/instances', () => {
  console.log('info/instances')
  return [{ id: MOCK_INSTANCE_ID }]
})

wsServer.register('call', ({
  instance_id: instanceId,
  zome,
  function: method,
  args
}) => {
  console.log('call', instanceId, zome, method, args)
  if (instanceId !== MOCK_INSTANCE_ID) {
    throw new Error(
      `Expected instance_id to be ${MOCK_INSTANCE_ID}, but got ${instanceId}`
    )
  }
  const mockZome = MOCK_ZOMES[zome]
  if (!mockZome) { throw new Error(`Unknown zome ${zome}`) }
  const zomeFunction = mockZome[method]
  if (!zomeFunction) { throw new Error(`Unknown function ${zome}/${method}`) }
  const result = { Ok: zomeFunction(args) }
  return JSON.stringify(result)
})
