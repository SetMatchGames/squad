/* global require module web3 */

const ethers = require('ethers')
const AutoBondJSON = require("../../app/build/contracts/AutoBond.json")
const CurveJSON = require("../../app/build/contracts/Curve.json")
const SimpleLinearCurveJSON = require("../../app/build/contracts/SimpleLinearCurve.json")
const SquadControllerJSON = require("./artifacts/SquadController.json")
const TokenClaimCheckJSON = require("./artifacts/TokenClaimCheck.json")
const squadControllerAddress = '0x19Ce2C83f2F4Da92ECbEd17606f4c51f04942f76'
const tokenClaimCheckAddress = '0x3e671040ffb4BbB9d93395f64b944901580Ba8A4'

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

let squadController
let tokenClaimCheck

function init (defaults) {
  if (initialized) {
    return [initialized, walletOrSigner]
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

  squadController = new ethers.Contract(
    squadControllerAddress, SquadControllerJSON.abi, walletOrSigner
  )
  tokenClaimCheck = new ethers.Contract(
    tokenClaimCheckAddress, TokenClaimCheckJSON.abi, walletOrSigner
  )

  if (defaults === undefined) {
    defaults = {
      gas: 9000000
    }
  }

  walletOrSigner.getAddress()
    .then(() => {
      initialized = true
    })

  return walletOrSigner
}

class BondAlreadyExists extends Error {
  constructor(message) {
    super(message)
    this.name = "BondAlreadyExists"
  }
}

async function networkFeeRate () {
  init()
  return await squadController.networkFeeRate()
}

async function newContribution (
  contributionId,
  feeRate,
  purchasePrice,
  submissionCb,
  confirmationCb,
  options
) {
  init()
  const walletAddress = await walletOrSigner.getAddress()
  const fullOptions = Object.assign({}, defaults, options, {gasLimit: 4712357})
  const name = `Squad Chess ${contributionId}`
  const symbol = `sc${contributionId.substring(0, 3).toUpperCase()}`
  const metadata = JSON.stringify({game: "Squad Chess", experiment: true})
  console.log(ethers)
  const tx = await squadController.newContribution(
    ethers.utils.formatBytes32String(contributionId),
    walletAddress,
    feeRate,
    purchasePrice,
    name,
    symbol,
    metadata,
    fullOptions
  )
  console.log(tx)
  submissionCb(tx)
  return handleConfirmationCallback(tx.hash, confirmationCb)
}

async function newBond (
  bondId,
  initialBuyNumber,
  submissionCb,
  confirmationCb,
  options = {},
  addressOfCurve
) {
  init()
  if (!addressOfCurve || addressOfCurve === '0x0000000000000000000000000000000000000000') { 
    addressOfCurve = simpleLinearCurveAddress
  }
  const bondHash = ethers.utils.id(bondId)
  const fullOptions = Object.assign({}, defaults, options)
  const curve = await autoBond.getCurve(bondHash)
  if (curve === '0x0000000000000000000000000000000000000000') {
    const tx = await autoBond.newBond(
      addressOfCurve,
      bondHash,
      initialBuyNumber,
      fullOptions
    )
    submissionCb(tx)
    return handleConfirmationCallback(tx.hash, confirmationCb)
  }
}

async function getSupply (bondId) {
  init()
  const bondHash = ethers.utils.id(bondId)
  return Number(await autoBond.getSupply(bondHash))
}

async function getBalance (bondId, holderAddress) {
  init()
  await window.ethereum.enable()
  holderAddress = holderAddress ? holderAddress : await walletOrSigner.getAddress()
  const bondHash = ethers.utils.id(bondId)
  return (await autoBond.getBalance(bondHash, holderAddress)).toNumber()
}

async function buy (units, bondId, submissionCb, confirmationCb, options = {}) {
  init()
  const bondHash = ethers.utils.id(bondId)
  const fullOptions = Object.assign({}, defaults, options)
  const tx = await autoBond.buy(
    units,
    bondHash,
    fullOptions
  )
  submissionCb(tx)
  return handleConfirmationCallback(tx.hash, confirmationCb)
}

async function sell (units, bondId, submissionCb, confirmationCb, options = {}) {
  init()
  const bondHash = ethers.utils.id(bondId)
  const fullOptions = Object.assign({}, defaults, options)
  const tx = await autoBond.sell(
    units,
    bondHash,
    fullOptions
  )
  submissionCb(tx)
  return handleConfirmationCallback(tx.hash, confirmationCb)
}

async function getBuyPrice (units, bondId) {
  init()
  const bondHash = ethers.utils.id(bondId)
  return Number(await autoBond.getBuyPrice(units, bondHash))
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
  const bondHash = ethers.utils.id(bondId)
  return await autoBond.getSellPrice(units, bondHash)
}

async function getMarketCap (bondId) {
  init()
  const bondHash = ethers.utils.id(bondId)
  const bond = await autoBond.bonds(bondHash)
  const curveAddress = bond.curve
  if (curveAddress == '0x0000000000000000000000000000000000000000') { 
    console.error(`Market for ${bondId} has no curve address set`)
  }
  const supply = bond.supply
  const cap = await getBuyPriceFromCurve(0, supply, curveAddress)
  return cap.toNumber()
}

function handleConfirmationCallback (txHash, callback) {
  return provider.waitForTransaction(txHash).then((receipt) => {
    callback(receipt)
  })
}

module.exports = {
  init,
  newBond,
  getSupply,
  getBalance,
  getBuyPrice,
  getBuyPriceFromCurve,
  getSellPrice,
  getMarketCap,
  buy,
  sell,
  BondAlreadyExists,

  newContribution,
  networkFeeRate
}
