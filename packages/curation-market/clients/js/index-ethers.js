const ethers = require('ethers')
const AutoBondJSON = require("../../app/build/contracts/AutoBond.json")
const SimpleLinearCurveJSON = require("../../app/build/contracts/SimpleLinearCurve.json")

const networkIds = {
  'ropsten': 3
}

const network = 'development'
const devUrl = 'http://localhost:8545'

let provider
let walletOrSigner
let autoBond
let autoBondAddress
let simpleLinearCurveAddress
let defaults

function init (defaults) {
  switch (network) {
    case 'development': {
      provider = new ethers.providers.JsonRpcProvider(devUrl)
      walletOrSigner = provider.getSigner(0)
      const mostRecentDevnet = Object.keys(AutoBondJSON.networks).pop()
      autoBondAddress = AutoBondJSON.networks[mostRecentDevnet].address
      simpleLinearCurveAddress = SimpleLinearCurveJSON.networks[mostRecentDevnet].address
      break
    }
    default: {
      provider = ethers.getDefaultProvider(network)
      const walletWithoutProvider = ethers.Wallet.createRandom()
      walletOrSigner = new ethers.Wallet(walletWithoutProvider.signingKey.privateKey, provider)
      autoBondAddress = AutoBondJSON.networks[networkIds[network]].address
      simpleLinearCurveAddress = SimpleLinearCurveJSON.networks[networkIds[network]].address
    }
  }
  autoBond = new ethers.Contract(autoBondAddress, AutoBondJSON.abi, walletOrSigner)

  if (defaults === undefined) {
    defaults = {
      gas: 900000
    }
  }
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
  addressOfCurve
) {
  init()
  let bondHash = ethers.utils.id(bondId)
  const fullOptions = Object.assign({}, defaults, options)
  let curve = await autoBond.getCurve(bondHash)
  if (curve === '0x0000000000000000000000000000000000000000') {
    return await autoBond.newBond(
      addressOfCurve = simpleLinearCurveAddress,
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
  getSellPrice,
  buy,
  sell,
  BondAlreadyExists
}

const id = Date.now().toString()
newBond(id, 0).then((tx) => {
  console.log(tx)
  // getBalance(id, tx.from).then(console.log)
  getBuyPrice(100, id).then(console.log)
})