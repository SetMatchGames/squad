const { spawn } = require('child_process')
const fs = require('fs')
const process = require('process')
const path = require('path')
const curationMarket = require('./curation-api')
const metastore = require('./metastore-api')

const runners = {
  "web-game-v0": async (gameData) => {
    let tab = window.open(gameData["url"])
    tab.focus
  },
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
  }
}

function registerRunner(type_, runner) {
  runners[type_] = runner
}

async function runGame(definition) {
  // TODO handle the case that a REST holochain uri is passed in
  console.log("squad.runGame", definition)
  const runner = runners[definition.Game.type_]
  return runner(JSON.parse(definition.Game.data))
}

// Combined metastore and curationMarket functions

// handle submitting a definition and creating a new bond at the same time
async function newDefinitionWithBond(
  definition, 
  addressOfCurve = '0x5142096f20916308fDF1540b16407680b7582f38', 
  initialBuyUnits = 0, 
  opts = {}
) {
  console.log("new def args", definition, addressOfCurve, initialBuyUnits, opts)
  const bondId = await metastore.createDefinition(definition)
  console.log("bond", await curationMarket.newBond(addressOfCurve, bondId, initialBuyUnits, opts))
  console.log("new bond created with definition!")
  return bondId
}

module.exports = {
  runGame,
  registerRunner,
  metastore,
  curationMarket,
  newDefinitionWithBond
}
