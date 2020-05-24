const ethers = require('ethers')
const AutoBondJSON = require("../../app/build/contracts/AutoBond.json")
const CurveJSON = require("../../app/build/contracts/Curve.json")
const SimpleLinearCurveJSON = require("../../app/build/contracts/SimpleLinearCurve.json")

const networkIds = {
  'ropsten': 3
}

const network = 'ropsten'
const devUrl = 'http://localhost:8545'

let initialized = false
let provider
let walletOrSigner
let autoBond
let curve
let autoBondAddress
let simpleLinearCurveAddress
let defaults

function init (defaults) {
  if (initialized) { 
    console.log('Skipping init')
    return 
  }

  console.log('Initializing...')

  switch (network) {
    case 'development': {
      // I think this might not be working right -- maybe instead we should be creating a wallet using one of the ganache keys
      provider = new ethers.providers.JsonRpcProvider(devUrl)
      walletOrSigner = provider.getSigner(0)
      const mostRecentDevnet = Object.keys(AutoBondJSON.networks).pop()
      autoBondAddress = AutoBondJSON.networks[mostRecentDevnet].address
      simpleLinearCurveAddress = SimpleLinearCurveJSON.networks[mostRecentDevnet].address
      break
    }
    default: {
      console.log('Trying to make provider...')
      provider = new ethers.providers.Web3Provider(web3.currentProvider)
      walletOrSigner = provider.getSigner()
      autoBondAddress = AutoBondJSON.networks[networkIds[network]].address
      simpleLinearCurveAddress = SimpleLinearCurveJSON.networks[networkIds[network]].address
    }
  }
  autoBond = new ethers.Contract(autoBondAddress, AutoBondJSON.abi, walletOrSigner)
  curve = new ethers.Contract(simpleLinearCurveAddress, CurveJSON.abi, walletOrSigner)

  if (defaults === undefined) {
    defaults = {
      gas: 900000
    }
  }

  initialized = true
}

class BondAlreadyExists extends Error {
  constructor(message) {
    super(message)
    this.name = "BondAlreadyExists"
  }
}

async function newBond (
  bondId,
  initialBuyNumber,
  options = {},
  addressOfCurve,
) {
  init()
  if (!addressOfCurve) { addressOfCurve = simpleLinearCurveAddress }
  let bondHash = ethers.utils.id(bondId)
  const fullOptions = Object.assign({}, defaults, options)
  let curve = await autoBond.getCurve(bondHash)
  if (curve === '0x0000000000000000000000000000000000000000') {
    return await autoBond.newBond(
      addressOfCurve,
      bondHash,
      initialBuyNumber,
      fullOptions
    )
  }
  throw new BondAlreadyExists(`Bond ${bondId} already exists.`)
}

async function getSupply (bondId) {
  init()
  let bondHash = ethers.utils.id(bondId)
  return await autoBond.getSupply(bondHash)
}

async function getBalance (bondId, holderAddress) {
  init()
  let bondHash = ethers.utils.id(bondId)
  return await autoBond.getBalance(bondHash, holderAddress)
}

async function buy (units, bondId, options = {}) {
  init()
  let bondHash = ethers.utils.id(bondId)
  const fullOptions = Object.assign({}, defaults, options)
  return await autoBond.buy(
    units,
    bondHash,
    fullOptions
  )
}

async function sell (units, bondId, options = {}) {
  init()
  let bondHash = ethers.utils.id(bondId)
  const fullOptions = Object.assign({}, defaults, options)
  return await autoBond.sell(
    units,
    bondHash,
    fullOptions
  )
}

async function getBuyPrice (units, bondId) {
  init()
  let bondHash = ethers.utils.id(bondId)
  return await autoBond.getBuyPrice(units, bondHash)
}

async function getBuyPriceFromCurve (supply, units, curveAddress) {
  init()
  if (curveAddress) {
    curve = new ethers.Contract(curveAddress, CurveJSON.abi, walletOrSigner)
  }
  return await curve.buyPrice(supply, units)
}

async function getSellPrice (units, bondId) {
  init()
  let bondHash = ethers.utils.id(bondId)
  return await autoBond.getSellPrice(units, bondHash)
}

module.exports = {
  init,
  newBond,
  getSupply,
  getBalance,
  getBuyPrice,
  getBuyPriceFromCurve,
  getSellPrice,
  buy,
  sell,
  BondAlreadyExists
}