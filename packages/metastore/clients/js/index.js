/* global require */

const WebSocket = require('rpc-websockets').Client

// TODO change 'squad' to 'metastore' here?
const squad = {}

function webSocketConnection (uri) {
  squad.connection = new WebSocket(uri)
  return squad.connection
}

function on (message, f) {
  squad.connection.on(message, f)
}

async function call (zome, method, inputs) {
  // TODO: Can we cache this?
  const instanceInfo = await squad.connection.call('info/instances', {})
  const params = {
    instance_id: instanceInfo[0].id,
    zome: zome,
    function: method,
    args: inputs
  }
  const result = JSON.parse(await squad.connection.call('call', params))

  if (result.Ok === undefined) {
    throw result
  }
  return result.Ok
}

async function createDefinition (definition, games = []) {
  return '0x' + await call('definitions', 'create_definition', { definition, games })
}

async function getDefinitions (addresses) {
  addresses = addresses.map(a => {
    return a.slice(2)
  })
  return call('definitions', 'get_definitions', { addresses })
}

async function getAddress (entry) {
  return call('definitions', 'get_entry_address', { entry })
}

async function getCatalogAddresses (catalogType, catalogName) {
  const addresses = await call(
    'definitions',
    'get_catalog_links',
    { catalog_type: catalogType, catalog_name: catalogName }
  )
  return addresses.map(a => {
    return `0x${a}`
  })
}

async function getAllDefinitionsOfType (catalogType) {
  const rawDefinitions = await call(
    'definitions',
    'get_all_definitions_of_type',
    { catalog_type: catalogType }
  )
  const definitions = {}
  for (d in rawDefinitions) {
    definitions[`0x${d}`] = rawDefinitions[d]
  }
  return definitions
}

async function getDefinitionsFromCatalog (catalogType, catalogName) {
  const rawDefinitions = await call(
    'definitions',
    'get_definitions_from_catalog',
    { catalog_type: catalogType, catalog_name: catalogName }
  )
  const definitions = {}
  for (d in rawDefinitions) {
    definitions[`0x${d}`] = rawDefinitions[d]
  }
  return definitions
}

async function getGameDefinitions (gameAddress, defType) {
  // gameAddress = gameAddress.slice(2)
  console.log(gameAddress)
  return getDefinitionsFromCatalog(defType, `${gameAddress} ${defType} Catalog`)
}

async function getGameFormats (gameAddress) {
  console.log(gameAddress)
  return getGameDefinitions(gameAddress, 'Format')
}

async function getGameComponents (gameAddress) {
  return getGameDefinitions(gameAddress, 'Component')
}

function close () {
  squad.connection.close()
}

module.exports = {
  webSocketConnection,
  on,
  call,
  createDefinition,
  getDefinitions,
  getAddress,
  getCatalogAddresses,
  getAllDefinitionsOfType,
  getDefinitionsFromCatalog,
  getGameDefinitions,
  getGameComponents,
  getGameFormats,
  close
}
