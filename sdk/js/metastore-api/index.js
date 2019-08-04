const WebSocket = require('rpc-websockets').Client

const squad = {}

function webSocketConnection(uri) {
  squad.connection = new WebSocket(uri)
  return squad.connection
}
  
function mockConnection(mock) {
  squad.connection = mock
  return squad.connection
}
  
function on(message, f) {
  squad.connection.on(message, f)
}
  
async function call(zome, method, inputs) {
  console.log("squad.call", zome, method, inputs)

  const instanceInfo = await squad.connection.call('info/instances', {})
  console.log('instanceInfo', instanceInfo)

  const params = {
    "instance_id": instanceInfo[0].id,
    "zome": zome,
    "function": method,
    "args": inputs
  }
  console.log("calling", params)
  const result = JSON.parse(await squad.connection.call('call', params))
  console.log("RESULT", result)

  if (result.Ok === undefined) {
    throw result
  }
  return result.Ok
}
  
async function createDefinition(definition) {
  return await call("definitions", "create_definition", {definition})
}
  
async function getDefinition(address) {
  return await call("definitions", "get_definition", {address})
}

async function getAddress(entry) {
  return await call("definitions", "get_entry_address", {entry})
}

async function getCatalogAddresses(catalog_type, catalog_name) {
  return await call("definitions", "get_catalog_links", {catalog_type, catalog_name})
}
  
async function getAllDefinitionsOfType(catalog_type) {
  return await call("definitions", "get_all_definitions_of_type", {catalog_type})
}
  
async function getDefinitionsFromCatalog(catalog_type, catalog_name) {
  return await call("definitions", "get_definitions_from_catalog", {catalog_type, catalog_name})
}

function close() {
  squad.connection.close()
}

module.exports = {
  webSocketConnection,
  mockConnection,
  on,
  call,
  createDefinition,
  getDefinition,
  getAddress,
  getCatalogAddresses,
  getAllDefinitionsOfType,
  getDefinitionsFromCatalog,
  close
}