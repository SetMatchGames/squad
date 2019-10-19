const { spawn } = require('child_process')
const fs = require('fs')
const process = require('process')
const path = require('path')
const curationMarket = require('./curation-api')
const metastore = require('./metastore-api')
const curationConfig = require('./curation-config.json')
const squadConfig = require('./squad-config.json')

const runners = {
  "web-game-v0": async (gameData) => {
    const gameUrl = new URL(gameData["url"])
    gameUrl.searchParams.set("squadUri", squadConfig.sdkUrl)
    let tab = window.open(gameUrl)
    tab.focus()
  }
}

function registerRunner(type_, runner) {
  runners[type_] = runner
}

async function runGame(definition) {
  console.log("squad.runGame", definition)
  const runner = runners[definition.Game.type_]
  return runner(JSON.parse(definition.Game.data))
}

// Combined metastore and curationMarket functions

// handle submitting a definition and creating a new bond at the same time
async function newDefinitionWithBond(
  definition,
  addressOfCurve = curationConfig.contracts.simpleLinearCurve,
  initialBuyUnits = 0,
  opts = {}
) {
  const bondId = await metastore.createDefinition(definition)
  await curationMarket.newBond(addressOfCurve, bondId, initialBuyUnits, opts)
  return bondId
}

module.exports = {
  runGame,
  registerRunner,
  metastore,
  curationMarket,
  newDefinitionWithBond
}
