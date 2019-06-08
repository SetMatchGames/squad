const { spawn } = require('child_process')
const fs = require('fs')
const process = require('process')
const WebSocket = require('rpc-websockets').Client
const path = require('path')

const squad = {}

const getElement = async (address) => {
  const info = await squad.connection.call('info/instances', {})
  const instanceId = info[0].id
  const agentId = info[0].agent

  const params = {
    "instance_id": instanceId,
    "zome": "elements",
    "function": "get_element",
    "params": {
      "address": address
    }
  }

  const result = JSON.parse(await squad.connection.call('call', params))
  // TODO add a test case for when there is an error, like incorrect address
  if (result.Ok === undefined) {
    console.log(result)
    throw result
  }
  return result.Ok
}

const runners = {
  "linux-bash-game-v0": async (formatAddress, gameData) => {
    // TODO: move all of the format stuff into sdk methods and let the game
    // handle it.
    // this function would end up just taking in game data and running the game
    console.log(formatAddress, gameData)
    // presume we are running a node linux bash squad client
    // start a process identified in the game data

    // get the format from holochain
    const format = (await getElement(formatAddress)).Format
    const components = await Promise.all(
      format.components.map(a => {
        return getElement(a)
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

const registerRunner = (type_, runner) => {
  runners[type_] = runner
}

const runGame = async (gameAddress) => {
  // TODO handle the case that a REST holochain uri is passed in
  console.log("squad.runGame", gameAddress)
  const game = (await getElement(gameAddress)).Game
  const runner = runners[game.type_]
  return runner(game.data)
}

const webSocketConnection = async (uri) => {
  squad.connection = new WebSocket(uri)
  return await on("open", () => {
    return squad.connection
  })
}

const mockConnection = (mock) => {
  squad.connection = mock
  return squad.connection
}

const on = (message, f) => {
  return squad.connection.on(message, f)
}

const call = (method, data) => {
  return squad.connection.call(method, data)
}

const contributeElement = async (element) => {
  return await call("contribute_element", {element})
}

const getIndex = async (baseAddress, tag) => {
  return await call("get_index", {baseAddress, tag})
}

module.exports = {
  webSocketConnection,
  mockConnection,
  registerRunner,
  on,
  call,
  runGame,
  contributeElement,
  getIndex
}
