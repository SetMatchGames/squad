/* global URL setTimeout localStorage */

import m from 'mithril'
import squad, { metastore, curationMarket } from '@squad/sdk'

import defs from '../scripts/load_development_defs.js'

import state from './state.js'
import settings from './settings.js'
import { stringToSquare } from './rules.js'

export const shortHash = (str) => {
  return `${str.slice(0, 3)}...${str.slice(-3)}`
}

export const findBoardRange = (variableIndex, startingPosition) => {
  let max = 0
  let min = stringToSquare(Object.keys(startingPosition)[0])[variableIndex]
  Object.keys(startingPosition).forEach(str => {
    const variable = stringToSquare(str)[variableIndex]
    if (variable > max) { max = variable }
    if (variable < min) { min = variable }
  })
  return {
    range: max - min,
    min
  }
}

export const connectSquad = (callback) => {
  metastore.webSocketConnection(settings.metastoreWs)

  metastore.on('open', async () => {
    // skip if we've already connected to Squad
    if (state.squad.connection) {
      console.log('Skipping on open')
    } else {
      // check ethereum connection
      await web3connection()

      test()

      // load up the default definitions (only relevant with the temporary metastore)
      const defaultDefs = await defs()

      // load up the local storage definitions along with the defaults (for now)
      let storedDefs = JSON.parse(localStorage.getItem('localDefinitions'))
      if (!storedDefs) {
        storedDefs = []
      }

      // make sure all stored defs and defaults are on Ethereum
      const localDefs = [...defaultDefs, ...storedDefs]
      console.log('local defs', localDefs)
      // await multiDefinition(localDefs)

      // get all the game's formats and components
      const formatDefs = await metastore.getGameFormats(settings.gameAddress)
      const componentDefs = await metastore.getGameComponents(settings.gameAddress)

      // restore everything in local storage
      refreshLocalStorage(formatDefs, componentDefs)

      // for each format
      for (const address in formatDefs) {
        // take out the extra 'Format' part of the object
        formatDefs[address] = formatDefs[address].Format
      }
      state.squad.rawFormats = formatDefs

      // for each component
      for (const address in componentDefs) {
        // take out the extra 'Component' part of the object
        componentDefs[address] = componentDefs[address].Component
      }
      state.squad.components = componentDefs

      state.squad.connection = 'connected'
      console.log('Squad Connection:', state.squad.connection)
    }

    if (callback) { await callback() }

    m.redraw()
  })
}

let tested = false
async function test() {
  const params = (new URL(document.location)).searchParams;
  console.log("TEST", params.get("test"))
  if(tested || params.get("test") !== "on") {
    return
  }
  tested = true

  function testLog(...args) {
    console.log("TEST", ...args)
  }

  let done = false
  function finish(...args) {
    testLog("Finish", ...args)
    done = true
  }

  async function wait() {
    while (!done) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    done = true
  }

  const ethers = curationMarket.getEthers()
  const signerAddress = await curationMarket.walletAddress()
  const contributionId = "abc123" // Date.now().toString()
  const feeRate = 200
  const purchasePrice = ethers.utils.parseEther("0.5")
  /*
  done = false
  testLog("newContribution", contributionId, feeRate, purchasePrice)
  await curationMarket.newContribution(contributionId, feeRate, purchasePrice, testLog, finish)
  wait()

  done = false
  testLog("buyLicense", contributionId)
  await curationMarket.buyLicense(contributionId, testLog, finish)
  testLog()
  wait()
  */
  done = false
  const supply = await curationMarket.totalSupplyOf(contributionId)
  const amount = curationMarket.linearCurveAmount(supply, purchasePrice.mul(10))
  testLog("buyLicense with extra amount", contributionId, amount)
  await curationMarket.buyLicense(contributionId, testLog, finish, amount)
  testLog()
  wait()

  testLog("totalSupplyOf", contributionId)
  testLog((await curationMarket.totalSupplyOf(contributionId)).toString())
  testLog()

  testLog("holdsLicenseFor", contributionId, signerAddress)
  testLog(await curationMarket.holdsLicenseFor(contributionId, signerAddress))
  testLog()

  done = false
  const validLicenses = await curationMarket.getValidLicenses(signerAddress)
  testLog(validLicenses, contributionId)
  const licenseId = validLicenses[contributionId][0].licenseId
  testLog("redeemAndSell", licenseId, 0)
  const claimAmount = await validLicenses[licenseId].claim.amount
  testLog("claimAmount     ", claimAmount.toString())
  testLog("licenseSellPrice", (await curationMarket.licenseSellPrice(licenseId)).toString())
  testLog("SellPriceFor    ", (await curationMarket.sellPriceFor(contributionId, claimAmount)).toString())
  await curationMarket.redeemAndSell(licenseId, 0, testLog, testLog, testLog, finish)
  testLog()
  wait()

  testLog(await curationMarket.getValidLicenses(signerAddress))
  // marketSize
  testLog("MarketSize          ", (await curationMarket.marketSize(contributionId)).toString())
  testLog("MarketSize of XYa123", (await curationMarket.marketSize("XYa123")).toString())

  // purchasePriceOf
  testLog("PurchasePriceOf       ", (await curationMarket.purchasePriceOf(contributionId)).toString())
  testLog("PurchasePriceOf XYa123", (await curationMarket.purchasePriceOf("XYa123")).toString())
}

async function web3connection () {
  const connection = curationMarket.init()
  let address
  try {
    address = await connection.getAddress()
  } catch (e) {
    address = e
  }
  if (typeof address !== 'string' || (await connection.provider.getNetwork()).chainId !== 3) {
    state.connectModal = true
  } else {
    state.connectModal = false
  }
  m.redraw()
}

async function multiDefinition (defs) {
  // submit the default definitions to make sure they have bonds on ethereum
  defs.forEach(async (def) => {
    await squad.definition(def, [settings.gameAddress], 100, 10)
  })
}

function refreshLocalStorage (formatDefs, componentDefs) {
  const localCatalog = []
  for (const key in formatDefs) {
    localCatalog.push(formatDefs[key])
  }
  for (const key in componentDefs) {
    localCatalog.push(componentDefs[key])
  }
  console.log('local Catalog size', localCatalog.length)
  localStorage.setItem('localDefinitions', JSON.stringify(localCatalog))
}

export const getMarketInfo = () => {
  connectSquad(async () => {
    // get the users licenses
    state.licenses = await squad.curationMarket.getValidLicenses()
    // for each format
    for (const address in state.squad.rawFormats) {
      // see if the current user owns the format
      // await getOwned(address)
      // get the market cap
      await getMarketCap(address)
      // get the purchasePrice
      await getPurchasePrice(address)
      m.redraw()
    }
    // for each component
    for (const address in state.squad.components) {
      // get the market cap
      await getMarketCap(address)
      m.redraw()
    }
  })
}

/*
async function getOwned (address) {
  const balance = await curationMarket.getBalance(address)
  state.owned[address] = balance
}
*/

async function getMarketCap (address) {
  const marketCap = await curationMarket.getMarketCap(address)
  state.marketCaps[address] = marketCap
}

async function getPurchasePrice (address) {
  const purchasePrice = await curationMarket.purchasePriceOf(address)
  state.squad.rawFormats[address].purchasePrice = purchasePrice
}

export const loadFormat = (address) => {
  connectSquad(async () => {
    // get the format
    const rawFormat = state.squad.rawFormats[address]

    // load the format
    if (rawFormat) {
      await getMarketInfo()
      if (!state.licenses[curationMarket.id(address)]) {
        m.route.set('/formats')
        console.log('Must purchase rights to use a format before using. Current tokens owned:', state.owned[address])
        // TODO Notification asking them to buy the format
      } else {
        state.squad.loadedFormat = getFullFormat(rawFormat, address)
        console.log('Loaded format:', state.squad.loadedFormat)
      }
      m.redraw()
    }
  })
}

export const previewFormat = (address) => {
  const rawFormat = state.squad.rawFormats[address]
  state.markets.previewedFormat = getFullFormat(rawFormat, address)
  console.log('Previewing format:', state.markets.previewedFormat)
}

export const getFullFormat = (rawFormat, address) => {
  // get the pieces
  const pieces = {}
  rawFormat.components.forEach(address => {
    const piece = state.squad.components[address]
    pieces[address] = Object.assign({},
      { name: piece.name },
      JSON.parse(piece.data)
    )
  })
  const fullFormat = Object.assign(JSON.parse(rawFormat.data), {
    pieces,
    address,
    name: rawFormat.name
  })

  // Get the X and Y ranges of the board
  const x = findBoardRange(0, fullFormat.startingPosition)
  const y = findBoardRange(1, fullFormat.startingPosition)
  fullFormat.boardSize = { x, y }

  return fullFormat
}

export const checkWinner = () => {
  if (state.game.legalTurns.length === 0) {
    let winner = 'White'
    if (state.game.turnNumber % 2 === 0) { winner = 'Black' }
    state.board.matchStatus = `${winner} wins!`
    console.log(state.board.matchStatus)
  }
}

export const buyLicenseWithAlerts = async (bondId, amount) => {
  await curationMarket.buyLicense(
    bondId,
    handleAlert('Submitted', 'buy order submitted'),
    handleAlert('Confirmed', 'buy order confirmed'),
    amount
  )
}

export const sellLicenseWithAlerts = async (licenseId, minPrice) => {
  console.log('sell license inputs', licenseId, minPrice)
  await curationMarket.redeemAndSell(
    licenseId,
    minPrice,
    handleAlert('Submitted', 'redeem order submitted'),
    handleAlert('Confirmed', 'redeem order confirmed'),
    handleAlert('Submitted', 'sell order submitted'),
    handleAlert('Confirmed', 'sell order confirmed')
  )
}

export const sellTokensWithAlerts = async (contributionId, amount, minPrice) => {
  console.log('sell token inputs', contributionId, amount, minPrice)
  await curationMarket.sellTokens(
    contributionId,
    amount,
    minPrice,
    handleAlert('Submitted', 'sell order submitted'),
    handleAlert('Confirmed', 'sell order confirmed')
  )
}

export const buyWithAlerts = async (units, bondId, options) => {
  await squad.curationMarket.buy(
    units,
    bondId,
    handleAlert('Submitted', 'buy order submitted'),
    handleAlert('Confirmed', 'buy order confirmed'),
    options
  )
}

export const sellWithAlerts = async (units, bondId) => {
  await squad.curationMarket.sell(
    units,
    bondId,
    handleAlert('Submitted', 'sell order submitted'),
    handleAlert('Confirmed', 'sell order confirmed')
  )
}

export const definitionWithAlerts = async (definition, games, initialBuyUnits, options) => {
  await squad.definition(
    definition,
    games,
    initialBuyUnits,
    handleAlert('Submitted', 'contribution submitted'),
    handleAlert('Confirmed', 'contribution confirmed'),
    options
  )
}

const handleAlert = (type, text) => {
  return () => { alert(type, text) }
}

const alert = (type, text) => {
  console.log('Creating alert', type, text)
  const alert = { type, text }
  state.alerts.push(alert)
  getMarketInfo()
}
