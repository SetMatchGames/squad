/* global require module */

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
  return call('definitions', 'create_definition', { definition, games })
}

async function getDefinitions (addresses) {
  return call('definitions', 'get_definitions', { addresses })
}

async function getAddress (entry) {
  return call('definitions', 'get_entry_address', { entry })
}

async function getCatalogAddresses (catalogType, catalogName) {
  const addresses = call(
    'definitions',
    'get_catalog_links',
    { catalog_type: catalogType, catalog_name: catalogName }
  )
  return addresses
}

async function getAllDefinitionsOfType (catalogType) {
  return call(
    'definitions',
    'get_all_definitions_of_type',
    { catalog_type: catalogType }
  )
}

async function getDefinitionsFromCatalog (catalogType, catalogName) {
  return call(
    'definitions',
    'get_definitions_from_catalog',
    { catalog_type: catalogType, catalog_name: catalogName }
  )
}

async function getGameDefinitions (gameAddress, defType) {
  return getDefinitionsFromCatalog(defType, `${gameAddress} ${defType} Catalog`)
}

async function getGameFormats (gameAddress) {
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
