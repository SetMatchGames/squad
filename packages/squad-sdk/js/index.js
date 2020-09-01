/* global module require URL */

const curationMarket = require('@squad/curation-client')
const metastore = require('@squad/metastore')
const matchmaking = require('@squad/matchmaking-client')
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
  games,
  initialBuyUnits = 0,
  opts = {},
  addressOfCurve
) {
  const bondId = await metastore.createDefinition(definition, games)
  await curationMarket.newBond(bondId, initialBuyUnits, opts, addressOfCurve)
  return bondId
}

// definition is an "idenpotentish" way to call newDefinitionWithBond
// it will check to see if the definition exists before creating it
async function definition (
  definition,
  games = [],
  initialBuyUnits = 0,
  opts = {},
  addressOfCurve
) {
  try {
    return await newDefinitionWithBond(
      definition,
      games,
      initialBuyUnits,
      opts,
      addressOfCurve
    )
  } catch (e) {
    if (e instanceof curationMarket.BondAlreadyExists) {
      return metastore.createDefinition(definition, games)
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
  matchmaking,
  definition
}
