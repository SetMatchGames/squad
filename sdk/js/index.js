const { spawn } = require('child_process')
const fs = require('fs')
const process = require('process')
const path = require('path')
const curationMarket = require('../../curation/api')
const metastore = require('./metastore-api')

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

module.exports = {
  runGame,
  registerRunner,
  metastore,
  curationMarket // methods: makeDefaults(account), makeBond(factory, defaults, bondABI)
}