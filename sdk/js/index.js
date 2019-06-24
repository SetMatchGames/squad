const { spawn } = require('child_process')
const fs = require('fs')
const process = require('process')
const WebSocket = require('rpc-websockets').Client
const path = require('path')

const squad = {}

const runners = {
  "linux-bash-game-v0": async (formatAddress, gameData) => {
    // TODO: move all of the format stuff into sdk methods and let the game
    // handle it.
    // this function would end up just taking in game data and running the game
    console.log(formatAddress, gameData)
    // presume we are running a node linux bash squad client
    // start a process identified in the game data

    // get the format from holochain
    const format = (await getDefinition(formatAddress)).Format
    const components = await Promise.all(
      format.components.map(a => {
        return getDefinition(a)
      })
    )

    // save those components to a file
    const componentsPath = path.resolve(__dirname, "squad_components.json")
    fs.writeFile(componentsPath, JSON.stringify(components), e => {
      if (e) {
        console.log(`could not write components to ${componentsPath}`)
        throw e
      }
    })

    // pass that file location to the game process through an environment
    // variable (in future versions this method of passing component data could
    // get more sophistocated, perhaps with macros in the command for passing as
    // command line arguments)
    const componentsPathEnvar = "SQUAD_COMPONENTS_PATH"
    process.env[componentsPathEnvar] = componentsPath

    const game = JSON.parse(gameData)
    await spawn(
      game.cmd,
      game.options,
      {shell: true, stdio: "inherit"},
    )
  },

  "web-game-v0": (gameData) => {
    throw "web-game-v0 not implemented"
  }
}

function registerRunner(type_, runner) {
  runners[type_] = runner
}

async function runGame(gameAddress) {
  // TODO handle the case that a REST holochain uri is passed in
  console.log("squad.runGame", gameAddress)
  const game = (await getDefinition(gameAddress)).Game
  const runner = runners[game.type_]
  return runner(game.data)
}

function webSocketConnection(uri) {
  squad.connection = new WebSocket(uri)
  return squad.connection
//  return await on('open', () => { return squad.connection })
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
  console.log("calling")
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

const getAllDefinitionsOfType = async (catalog_type) => {
  return await call("definitions", "get_all_definitions_of_type", {catalog_type})
}

const getDefinitionsFromCatalog = async (catalog_type, catalog_name) => {
  console.log("getDefinitionsFromCatalog called with", catalog_type, catalog_name)
  return await call("definitions", "get_definitions_from_catalog", {catalog_type, catalog_name})
}

module.exports = {
  webSocketConnection,
  mockConnection,
  runGame,
  registerRunner,
  on,
  call,
  createDefinition,
  getDefinition,
  getAllDefinitionsOfType,
  getDefinitionsFromCatalog
}

