const WebSocket = require('rpc-websockets').Client
const IPFS = require('ipfs')

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
  console.warn("let's depreciate the on function")
  squad.connection.on(message, f)
}

async function call(zome, method, inputs) {

  const instanceInfo = await squad.connection.call('info/instances', {})

  const params = {
    "instance_id": instanceInfo[0].id,
    "zome": zome,
    "function": method,
    "args": inputs
  }
  const result = JSON.parse(await squad.connection.call('call', params))

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
  return await call(
    "definitions",
    "get_catalog_links",
    {catalog_type, catalog_name}
  )
}

async function getAllDefinitionsOfType(catalog_type) {
  return await call(
    "definitions",
    "get_all_definitions_of_type",
    {catalog_type}
  )
}

async function getDefinitionsFromCatalog(catalog_type, catalog_name) {
  return await call(
    "definitions",
    "get_definitions_from_catalog",
    {catalog_type, catalog_name}
  )
}

function close() {
  squad.connection.close()
}

// Networking functions
  // Create a node before trying to share definitions
function createNode(url) {
  return new IPFS({
    repo: `${url}/ipfsRepo/${Math.random()}`,
    EXPERIMENTAL: {
      pubsub: true
    },
    config: {
      Addresses: {
        Swarm: [
          '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
        ]
      }
    }
  })
}

const submitted = {}

function shareDefinitions(node, TOPIC, typeArray, shareFunction) {
  // when someone sends deffinions, submit them
  // console.log("sharing definitions")
  setTimeout(
    () => {
      node.pubsub.subscribe(TOPIC, (message) => {
        const data = JSON.parse(message.data.toString())
        data.forEach((def) => {
          let key = JSON.stringify(def)
          if (!submitted[key]) {
            // console.log("submitting", def)
            shareFunction(def)
            submitted[key] = true
          }
        })
      })
    },
    4000
  )

  // periodically send all the definitions you have
  setInterval(
    () => {
      typeArray.forEach(type => {
        metastore.getAllDefinitionsOfType(type).then(defs => {
          // console.log("publishing", defs)
          node.pubsub.publish(TOPIC, Buffer.from(JSON.stringify(defs), 'utf-8'))
        })
      })
    },
    10000
  )
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
  close,
  networking: {
    createNode,
    shareDefinitions
  }
}
