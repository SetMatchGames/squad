const { spawn } = require('child_process')
const fs = require('fs')
const process = require('process')
const path = require('path')
const curationMarket = require('./curation-api')
const metastore = require('./metastore-api')
const config = require('./curation-config.json')

const runners = {
  "web-game-v0": async (gameData) => {
    let tab = window.open(gameData["url"])
    tab.focus
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
  addressOfCurve = config.contracts.simpleLinearCurve, 
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
