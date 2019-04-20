const { spawn } = require('child_process')
const fs = require('fs')
const process = require('process')
const WebSocket = require('rpc-websockets').Client
const path = require('path')

const squad = {}

const runners = {
  "linux-bash-game-v0": async (agentId, formatAddress, gameData) => {
    // presume we are running a node linux bash squad client
    // start a process identified in the game data

    // get the format from holochain
    const format = [formatAddress]
    // pass the format into a new child process that takes in the format and
    // starts the game (Formats not being passed yet)

    // TODO resolve the format and all components in the format
    const components = '[{"fake": "component"}]'

    // save those components to a file
    const componentsPath = path.resolve(__dirname, "squad_components.json")
    fs.writeFile(componentsPath, components, e => {
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

  "web-game-v0": (agent, formatAddress, gameData) => {
    if (!window) {
      console.log("web-game-v0 needs to launch from web squad")
      return
    }
    // web-game-v0 requires a url for where the game is
    // TODO how do we document (or self document) the game data
    // requirements for the different game types
    // Consider adding macros for formatAddress, agent.id, agent addr
    // etc. This would allow us to create a large number of options
    // for passing context to the web game
    let gameURL = new URL(gameData.__webGameV0.gameURL)
    gameURL.searchParams.append("squad-web-game-v0-format", formatAddress)
    gameURL.searchParams.append("squad-web-game-v0-agent-nick", agent.id)
    gameURL.searchParams.append(
      "squad-web-game-v0-agent-addr",
      agent.agentId,
    )
    window.open(gameURL, "_blank")
  }
}

const registerRunner = (type_, runner) => {
  runners[type_] = runner
}

const runGame = async (
  gameAddress,
  formatAddress,
) => {

  // TODO handle the case that a REST holochain uri is passed in
  await squad.connection.on('open', async () => {
    const info = await squad.connection.call('info/instances', {})
    const instanceId = info[0].id
    const agentId = info[0].agent

    const params = {
      "instance_id": instanceId,
      "zome": "elements",
      "function": "get_element",
      "params": {
        "address": gameAddress
      }
    }

    const result = JSON.parse(await squad.connection.call('call', params))
    // TODO add a test case for when there is an error, like incorrect address
    if (result.Ok === undefined) {
      console.log(result)
      throw result
    }
    const runner = runners[result.Ok.Game.type_]


    // Runners unpack the format and present it to the game in a consistent way
    // should this be done with the game data as well? what if the game data is
    // very large?
    // - no, game contributors have the ability to factor address game
    // data however they want but they don't have that ability with formats
    return runner(agentId, formatAddress, result.Ok.Game.data)
  })
}

const webSocketConnection = (uri) => {
  squad.connection = new WebSocket(uri)
}

const mockConnection = (mock) => {
  squad.connection = mock
}

module.exports = {
  webSocketConnection,
  mockConnection,
  runGame,
  registerRunner
}
