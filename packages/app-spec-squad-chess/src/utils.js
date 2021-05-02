/* global localStorage ethereum */

import m from 'mithril'
import squad, { curationMarket } from '@squad/sdk'

// import defs from '../scripts/load_development_defs.js'

import state from './state.js'
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

// functions required
// web3connect(contributions())
// web3connect(licenses())

export const handleLoadContributions = () => {
  if (state.squad.account) {
    loadContributions()
      .then(res => {
        console.log('loaded contributions')
      })
      .catch(err => {
        console.error(err)
      })
  } else {
    web3connection()
      .then(async () => {
        await loadContributions()
      })
      .catch(err => {
        console.error(err)
      })
  }
}

const loadContributions = async () => {
  state.squad.rawVariants = {}
  state.squad.orderedVariants = await squad.getFormats()
  state.squad.orderedVariants.forEach(f => {
    state.squad.rawVariants[f.id] = Object.assign({},
      f.definition.Format,
      {
        fee: f.feeRate,
        purchasePrice: f.purchasePrice
      }
    )
  })

  state.squad.components = {}
  state.squad.orderedComponents = await squad.getComponents()
  state.squad.orderedComponents.forEach(c => {
    state.squad.components[c.id] = Object.assign({},
      c.definition.Component,
      {
        fee: c.feeRate,
        purchasePrice: c.purchasePrice
      }
    )
  })

  const params = (new URL(document.location)).searchParams
  if (params.get('variant')) {
    state.markets.idToSearch = params.get('variant')
    if (state.squad.rawVariants[state.markets.idToSearch]) {
      console.log('setting searched variant', state.markets.idToSearch)
      state.markets.searchedVariant = state.markets.idToSearch
    }
  }

  m.redraw()
}

export const handleLoadContribution = (id) => {
  if (state.squad.account) {
    loadContribution(id)
      .then(res => {
        console.log('loaded contribution', id)
      })
      .catch(err => {
        console.error(err)
      })
  } else {
    web3connection()
      .then(async () => {
        await loadContribution(id)
      })
      .catch(err => {
        console.error(err)
      })
  }
}

const loadContribution = async (id) => {
  state.squad.rawVariants = {}
  const f = await squad.getContribution(id)
  if (!f.definition.Variant) { return }
  state.squad.rawVariants[f.id] = Object.assign({},
    f.definition.Variant,
    {
      fee: f.feeRate,
      purchasePrice: f.purchasePrice
    }
  )
  m.redraw()
}

export const handleLoadLicenses = () => {
  if (state.squad.account) {
    loadLicenses()
      .then(res => {
        console.log('loaded licenses', res)
      })
      .catch(err => {
        console.error(err)
      })
  } else {
    web3connection()
      .then(async () => {
        await loadLicenses()
      })
      .catch(err => {
        console.error(err)
      })
  }
}

const loadLicenses = async () => {
  state.licenses = await squad.getLicenses(state.squad.address)
  m.redraw()
}

export const refreshSquad = (callback) => {
  // skip if we've already connected to Squad
  if (state.squad.account === 'connected') {
    console.log('Skipping on open')
  } else {
    // check ethereum connection
    web3connection()
      .then(r => {
        // test()

        // load up the default definitions (only relevant with the temporary metastore)
        // const defaultDefs = await defs()

        // load up the local storage definitions along with the defaults (for now)
        let storedDefs = JSON.parse(localStorage.getItem('localDefinitions'))
        console.log('stored defs', storedDefs)
        if (!storedDefs) {
          storedDefs = []
        }

        // make sure all stored defs and defaults are on Ethereum
        const localDefs = [...storedDefs]
        console.log('local defs', localDefs)
        // multiDefinition(localDefs)

        state.squad.rawVariants = {}
        squad.getFormats()
          .then(variants => {
            console.log('got variants', variants)
            state.squad.orderedVariants = variants
            state.squad.orderedVariants.forEach(f => {
              state.squad.rawVariants[f.id] = f.definition.Format
            })
            m.redraw()
          })
          .catch(e => {
            console.error('getVariants error:', e)
          })

        state.squad.components = {}
        squad.getComponents()
          .then(components => {
            console.log('got compoentns', components)
            state.squad.orderedComponents = components
            state.squad.orderedComponents.forEach(c => {
              state.squad.components[c.id] = c.definition.Component
            })
            m.redraw()
          })
          .catch(e => {
            console.error('getComponents error:', e)
          })

        if (typeof callback === 'function') { callback() }
      })
      .catch(e => {
        console.error('Web3 connection error:', e)
      })
  }
}

/*
let tested = false
async function test () {
  const params = (new URL(document.location)).searchParams
  console.log('TEST', params.get('test'))
  if (tested || params.get('test') !== 'on') {
    return
  }
  tested = true

  function testLog (...args) {
    console.log('TEST', ...args)
  }

  let done = false
  function finish (...args) {
    testLog('Finish', ...args)
    done = true
  }

  async function wait () {
    while (!done) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    done = true
  }

  const ethers = curationMarket.getEthers()
  const signerAddress = await curationMarket.walletAddress()
  const contributionId = 'abc123' // Date.now().toString()
  const feeRate = 200
  const purchasePrice = ethers.utils.parseEther('0.5')
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

  done = false
  const supply = await curationMarket.totalSupplyOf(contributionId)
  const amount = curationMarket.linearCurveAmount(supply, purchasePrice.mul(10))
  testLog('buyLicense with extra amount', contributionId, amount)
  await curationMarket.buyLicense(contributionId, testLog, finish, amount)
  testLog()
  wait()

  testLog('totalSupplyOf', contributionId)
  testLog((await curationMarket.totalSupplyOf(contributionId)).toString())
  testLog()

  testLog('holdsLicenseFor', contributionId, signerAddress)
  testLog(await curationMarket.holdsLicenseFor(contributionId, signerAddress))
  testLog()

  done = false
  const validLicenses = await curationMarket.getValidLicenses(signerAddress)
  testLog(validLicenses, contributionId)
  const licenseId = validLicenses[contributionId][0].licenseId
  testLog('redeemAndSell', licenseId, 0)
  const claimAmount = await validLicenses[licenseId].claim.amount
  testLog('claimAmount     ', claimAmount.toString())
  testLog('licenseSellPrice', (await curationMarket.licenseSellPrice(licenseId)).toString())
  testLog('SellPriceFor    ', (await curationMarket.sellPriceFor(contributionId, claimAmount)).toString())
  await curationMarket.redeemAndSell(licenseId, 0, testLog, testLog, testLog, finish)
  testLog()
  wait()

  testLog(await curationMarket.getValidLicenses(signerAddress))
  // marketSize
  testLog('MarketSize          ', (await curationMarket.marketSize(contributionId)).toString())
  testLog('MarketSize of XYa123', (await curationMarket.marketSize('XYa123')).toString())

  // purchasePriceOf
  testLog('PurchasePriceOf       ', (await curationMarket.purchasePriceOf(contributionId)).toString())
  testLog('PurchasePriceOf XYa123', (await curationMarket.purchasePriceOf('XYa123')).toString())
}
*/
async function web3connection () {
  const connection = curationMarket.init()
  let address
  try {
    address = await connection.getAddress()
    state.squad.account = address
  } catch (e) {
    address = e
  }
  console.log(connection, connection.provider, (await connection.provider.getNetwork()).chainId)
  const one = (typeof address === 'string')
  let two
  try {
    const network = await connection.provider.getNetwork()
    if (network.chainId === 3) {
      two = true
    } else {
      console.error('Wrong network', network)
      two = true
    }
  } catch (e) {
    console.error('Two error', e)
    two = false
  }
  const three = !!ethereum.selectedAddress
  console.log(one, two, three)
  if (one && two && three) {
    state.connectModal = false
    state.squad.connection = 'connected'
  } else {
    state.connectModal = true
    state.squad.connection = 'not connected'
  }
  m.redraw()
}
/*
async function multiDefinition (defs) {
  // submit the default definitions to make sure they have bonds on ethereum
  await Promise.all(defs.map(async (def) => {
    return squad.definition(def, [settings.gameAddress], 100, 10)
  }))
}

function refreshLocalStorage (variantDefs, componentDefs) {
  const localCatalog = []
  for (const key in variantDefs) {
    localCatalog.push(variantDefs[key])
  }
  for (const key in componentDefs) {
    localCatalog.push(componentDefs[key])
  }
  console.log('local Catalog size', localCatalog.length)
  localStorage.setItem('localDefinitions', JSON.stringify(localCatalog))
}
*/
export const getMarketInfo = () => {
  refreshSquad(async () => {
    // get the logged in user's available withdraw amount
    state.withdrawAmount = await squad.curationMarket.withdrawAmount()
    // get the users licenses
    state.licenses = await squad.curationMarket.getValidLicenses()
    // for each variant
    for (const address in state.squad.rawVariants) {
      try {
        // see if the current user owns the variant
        // await getOwned(address)
        // get the market cap
        await getMarketCap(address)
        // get the purchasePrice
        await getPurchasePrice(address)
        await getBeneficiaryFee(address)
        m.redraw()
      } catch (e) {
        console.error('Invalid contribution', address, state.squad.rawVariants[address], e)
        delete state.squad.rawVariants[address]
        // remove invalid contributions
      }
    }
    // for each component
    for (const address in state.squad.components) {
      try {
        // get the market cap
        await getMarketCap(address)
        m.redraw()
      } catch (e) {
        console.error('Invalid contribution', state.squad.components[address], e)
        delete state.squad.components[address]
      }
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
  const marketCap = await curationMarket.marketSize(address)
  state.marketCaps[address] = marketCap
  console.log('Market cap', address, marketCap)
}

async function getPurchasePrice (address) {
  const purchasePrice = await curationMarket.purchasePriceOf(address)
  state.squad.rawVariants[address].purchasePrice = purchasePrice
  console.log('Purchase price', address, purchasePrice)
}

async function getBeneficiaryFee (address) {
  const fee = await curationMarket.feeOf(address)
  state.squad.rawVariants[address].fee = Number(fee) / 100
  console.log('Fee', address, Number(fee) / 100)
}

export const loadVariant = async (address) => {
  // check if we've already connected to web3
  if (!state.squad.account) {
    await web3connection()
  }
  // check if we've already loaded this address
  if (!state.squad.rawVariants || !state.squad.rawVariants[address]) {
    // if not, load contributions
    await loadContributions()
  }
  // check if we've already loaded a license for this address and account
  if (!state.licenses || !state.licenses[address]) {
    // if not, load licenses
    await loadLicenses()
  }
  // then, load the variant
  const rawVariant = state.squad.rawVariants[address]
  if (rawVariant) {
    console.log('raw variant found and loading')
    if (!state.licenses[address]) {
      m.route.set('/variants')
      console.log('Must purchase rights to use a variant before using. Current tokens owned:', state.owned[address])
      // TODO Notification asking them to buy the variant
    } else {
      state.squad.loadedVariant = getFullVariant(rawVariant, address)
      console.log('Loaded variant:', state.squad.loadedVariant)
    }
    m.redraw()
  }
}

export const previewVariant = (address) => {
  const rawVariant = state.squad.rawVariants[address]
  state.markets.previewedVariant = getFullVariant(rawVariant, address)
  console.log('Previewing variant:', state.markets.previewedVariant)
}

export const getFullVariant = (rawVariant, address) => {
  // get the pieces
  const pieces = {}
  console.log(rawVariant, 'rawVariant')
  rawVariant.components.forEach(address => {
    const piece = state.squad.components[address]
    pieces[address] = Object.assign({},
      { name: piece.name },
      JSON.parse(piece.data)
    )
  })
  const fullVariant = Object.assign(JSON.parse(rawVariant.data), {
    pieces,
    address,
    name: rawVariant.name
  })

  // Get the X and Y ranges of the board
  const x = findBoardRange(0, fullVariant.startingPosition)
  const y = findBoardRange(1, fullVariant.startingPosition)
  fullVariant.boardSize = { x, y }

  return fullVariant
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

export const definitionWithAlerts = async (
  definition,
  games,
  feeRate,
  purchasePrice,
  options
) => {
  await squad.definition(
    definition,
    games,
    feeRate,
    purchasePrice,
    handleAlert('Submitted', 'contribution submitted'),
    handleAlert('Confirmed', 'contribution confirmed'),
    options
  )
}

export const withdrawWithAlerts = async () => {
  await curationMarket.withdraw(
    handleAlert('Submitted', 'withdraw request submitted'),
    handleAlert('Confirmed', 'withdraw confirmed')
  )
}

export const handleAlert = (type, text) => {
  return () => { alert(type, text) }
}

export const alert = (type, text) => {
  console.log('Creating alert', type, text)
  const alert = { type, text }
  state.alerts.push(alert)
  console.log('current alerts', state.alerts)
  handleLoadContributions()
  handleLoadLicenses()
  // getMarketInfo()
}
