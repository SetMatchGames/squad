const WebSocket = require('rpc-websockets').Client
// const IPFS = require('ipfs')

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

async function getDefinition (address) {
  return call('definitions', 'get_definition', { address })
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
  console.log('getting defs from cat', catalogType, catalogName)
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

/*

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
  setTimeout(
    () => {
      node.pubsub.subscribe(TOPIC, (message) => {
        const data = JSON.parse(message.data.toString())
        data.forEach((def) => {
          let key = JSON.stringify(def)
          if (!submitted[key]) {
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
        getAllDefinitionsOfType(type).then(defs => {
          node.pubsub.publish(TOPIC, Buffer.from(JSON.stringify(defs), 'utf-8'))
        })
      })
    },
    10000
  )
}

*/

module.exports = {
  webSocketConnection,
  on,
  call,
  createDefinition,
  getDefinition,
  getAddress,
  getCatalogAddresses,
  getAllDefinitionsOfType,
  getDefinitionsFromCatalog,
  getGameDefinitions,
  getGameComponents,
  getGameFormats,
  close/*,
  networking: {
    createNode,
    shareDefinitions
  } */
}
