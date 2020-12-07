/* global module require URL */
const crypto = require('crypto')

const curationMarket = require('@squad/curation-client')
const matchmaking = require('@squad/matchmaking-client')
const squadConfig = require('./squad-config.json')
const graphQueries = require('./graphQueries.js')

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

async function definition (
  definition,
  games = [],
  feeRate,
  purchasePrice,
  submissionCb,
  confirmationCb,
  opts = {}
) {
  const bondId = '0x'+crypto.createHash('sha256').update(JSON.stringify(definition)).digest('hex')
  await curationMarket.newContribution(
    bondId,
    feeRate,
    purchasePrice,
    definition,
    submissionCb,
    confirmationCb,
    opts
  )
}

async function getFormats () {
  return await getContributions('Format')
}

async function getComponents () {
  return await getContributions('Component')
}

async function getContributions(type) {
  const ethers = curationMarket.getEthers()
  const contributions = await graphQueries.contributions()
  const results = []
  contributions.forEach(c => {
    c.definition = JSON.parse(c.definition)
    c.feeRate = c.feeRate / 100
    c.purchasePrice = ethers.utils.formatEther(c.purchasePrice)
    c.supply = ethers.utils.formatEther(c.supply)
    if (c.definition[type]) {
      results.push(c)
    }
  })
  console.log('found contributions', type, results)
  return results
}

async function getContribution (id) {
  const ethers = curationMarket.getEthers()
  const contribution = await graphQueries.contributionById(id)
  const result = Object.assign({}, contribution, {
    definition: JSON.parse(contribution.definition),
    feeRate: contribution.feeRate / 100,
    purchasePrice: ethers.utils.formatEther(contribution.purchasePrice),
    supply: ethers.utils.formatEther(contribution.supply)
  })
  return result
}

async function getLicenses (address) {
  if (!address) { address = await curationMarket.walletAddress() }
  const licenses = await graphQueries.licensesOf(address)
  const dict = {}
  for(let i = 0; i < licenses.length; i++) {
    const l = licenses[i]
    if(!dict[l.contribution.id]) { dict[l.contribution.id] = [] }
    l.sellAmount = await sellAmount(l.amount, l.contribution.supply, l.contribution.feeRate)
    dict[l.contribution.id].push(l)
  }
  return dict
}

async function sellAmount (amount, supply, feeRate) {
  const ethers = curationMarket.getEthers()
  amount = ethers.utils.bigNumberify(amount)
  supply = ethers.utils.bigNumberify(supply)
  let price = await curationMarket.linearCurvePrice(supply.sub(amount), amount)
  price = ethers.utils.parseEther(price)
  const fee = price.mul(feeRate).div(10000)
  price = price.sub(fee)
  return ethers.utils.formatEther(price)
}

module.exports = {
  runGame,
  registerRunner,
  curationMarket,
  matchmaking,
  definition,
  getFormats,
  getComponents,
  getContribution,
  getLicenses
}
