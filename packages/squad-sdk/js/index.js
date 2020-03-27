/* global require URL */

const curationMarket = require('@squad/curation-client')
const metastore = require('@squad/metastore')
const p2p = require('@squad/p2p')
const squadConfig = require('./squad-config.json')

const runners = {
  'web-game-v0': async (gameData) => {
    const gameUrl = new URL(gameData.url)
    gameUrl.searchParams.set('squadUri', squadConfig.sdkUrl)
    const tab = window.open(gameUrl)
    tab.focus()
  }
}

function registerRunner (type_, runner) {
  runners[type_] = runner
}

async function runGame (definition) {
  console.log('squad.runGame', definition)
  const runner = runners[definition.Game.type_]
  return runner(JSON.parse(definition.Game.data))
}

// Combined metastore and curation functions

// handle submitting a definition and creating a new bond at the same time
async function newDefinitionWithBond (
  definition,
  addressOfCurve = curationMarket.config.contracts.simpleLinearCurve,
  initialBuyUnits = 0,
  opts = {}
) {
  const bondId = await metastore.createDefinition(definition)
  await curationMarket.newBond(addressOfCurve, bondId, initialBuyUnits, opts)
  return bondId
}

// definition is an "idenpotentish" way to call newDefinitionWithBond
// it will check to see if the definition exists before creating it
async function definition (
  definition,
  addressOfCurve = curationMarket.config.contracts.simpleLinearCurve,
  initialBuyUnits = 0,
  opts = {}
) {
  try {
    return await newDefinitionWithBond(
      definition,
      addressOfCurve,
      initialBuyUnits,
      opts
    )
  } catch (e) {
    if (e instanceof curationMarket.BondAlreadyExists) {
      return metastore.createDefinition(definition)
    } else {
      throw e
    }
  }
}

module.exports = {
  runGame,
  registerRunner,
  metastore,
  curationMarket,
  definition,
  newDefinitionWithBond
}
