/* global require module web3 */

const ethers = require('ethers')
const AutoBondJSON = require("../../app/build/contracts/AutoBond.json")
const CurveJSON = require("../../app/build/contracts/Curve.json")
const SimpleLinearCurveJSON = require("../../app/build/contracts/SimpleLinearCurve.json")
const SquadControllerJSON = require("./artifacts/SquadController.json")
const TokenClaimCheckJSON = require("./artifacts/TokenClaimCheck.json")
const LinearCurveJSON = require("./artifacts/LinearCurve.json")
const BondingCurveFactoryJSON = require("./artifacts/BondingCurveFactory.json")
const ERC20JSON = require("./artifacts/ERC20.json")
const squadControllerAddress = '0x998c16377Bf29759C573Aae62ea23bDADba936d3'
const tokenClaimCheckAddress = '0x917C936370a345E3EC97B134E095F30697524B9d'
const linearCurveAddress = '0x682e04D70c12e2D4eEeFF82e03e0E0c6EFC97eaf'
const bondingCurveFactoryAddress = '0x3F3191211352f7b5562D4960f505eF8be77f3b38'
const reserveTokenAddress = '0x7B16Ef4F69e0858e19294F2c2D9A8530E0a74EBc'

const networkIds = {
  'ropsten': 3
}

function bnsqrt (a, precision) {
  precision = precision <= 0 ? 1 : precision
  let x = a
  let root
  while (true) {
    root = a.div(x).add(x).div(2)
    if (root.sub(x).abs().lte(precision)) {
      return root
    }
    x = root
  }
}

function linearCurveAmount (s, p) {
  // simple linear curve x=y given
  // supply S and price P amount A = 1/2(squrt(8P+(2S+1)^2)-2S-1)
  // We scale the curve down by 10^18 however so we need to multiply
  // the P term here by 10^18
  const precision = 1
  const pMult = (new ethers.utils.BigNumber('10')).pow(18).mul(8)
  const a = bnsqrt(
    s.mul(2)
      .add(1)
      .pow(2)
      .add(p.mul(pMult)),
    precision
  ).sub(s.mul(2))
    .sub(1)
    .div(2)
  return a.add(precision)
}

const network = 'ropsten'
const devUrl = 'http://localhost:8545'

let initialized = false
let provider
let walletOrSigner
let autoBond
let curve, linearCurve // linear curve is the new practical curve
let autoBondAddress
let simpleLinearCurveAddress
let defaults

let squadController
let tokenClaimCheck
let bondingCurveFactory
let reserveToken

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
  linearCurve = new ethers.Contract(linearCurveAddress, LinearCurveJSON.abi, walletOrSigner)
  bondingCurveFactory = new ethers.Contract(bondingCurveFactoryAddress, BondingCurveFactoryJSON.abi, walletOrSigner)
  squadController = new ethers.Contract(
    squadControllerAddress, SquadControllerJSON.abi, walletOrSigner
  )
  tokenClaimCheck = new ethers.Contract(
    tokenClaimCheckAddress, TokenClaimCheckJSON.abi, walletOrSigner
  )
  reserveToken = new ethers.Contract(reserveTokenAddress, ERC20JSON.abi, walletOrSigner)

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

// Replaces newBond
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

// replaces getSupply
async function totalSupplyOf(contributionId) /* returns BigNumber */ {
  init()
  return await squadController.totalSupplyOf(
    ethers.utils.formatBytes32String(contributionId)
  )
}

async function getSupply (bondId) {
  init()
  const bondHash = ethers.utils.id(bondId)
  return Number(await autoBond.getSupply(bondHash))
}

async function getLicenseInfo(licenseId) {
  const bytes32Id = await squadController.validLicenses(licenseId)
  const contributionId = ethers.utils.parseBytes32String(bytes32Id)
  if (bytes32Id === '') {
    return false
  }
  const [beneficiary, feeRate, purchasePrice] = await squadController.contributions(bytes32Id)
  const contribution = {beneficiary, feeRate, purchasePrice}
  if (contribution.beneficiary === ethers.constants.AddressZero) {
    return false
  }
  const [token, amount] = await tokenClaimCheck.claims(licenseId)
  const claim = {token, amount}
  if (claim.token === ethers.constants.AddressZero) {
    return false
  }
  return { licenseId, contributionId, contribution, claim }
}

/**
 * getValidLicenses returns all valid licenses held by `holderAddress`
 *
 * {
 *   licenseId: licenseInfo,
 *   contributionId: [licenseInfo]
 * }
 */
async function getValidLicenses(holderAddress) {
  init()
  const licenseBalance = parseInt((await tokenClaimCheck.balanceOf(holderAddress)).toString(), 10)
  console.log("TEST licenseBalance", licenseBalance)
  const licenseIds = await Promise.all(
    [...Array(licenseBalance).keys()].map(async (i) => {
      return await tokenClaimCheck.tokenOfOwnerByIndex(holderAddress, i)
    })
  )
  console.log("TEST licenseIds", licenseIds)
  const validLicenses = {}
  await Promise.all(licenseIds.map(async (licenseId) => {
    const licenseInfo = await getLicenseInfo(licenseId)
    console.log("TEST licenseInfo for", licenseId, licenseInfo)
    if(!licenseInfo) {
      // NFT is not a valid squad license
      return
    }
    validLicenses[licenseId] = licenseInfo
    validLicenses[licenseInfo.contributionId] = [
      licenseInfo, ...(validLicenses[licenseInfo.contributionId] || [])
    ]
    console.log("TEST Valid Licenses", validLicenses)
  }))
  return validLicenses
}

// replaces getBalance
async function holdsLicenseFor(contributionId, holderAddress) {
  init()
  const validLicenses = (await getValidLicenses(holderAddress))[contributionId] || []
  for (let i=0; i<validLicenses.length; i++) {
    const holdsLicense = await squadController.holdsLicense(
      ethers.utils.formatBytes32String(contributionId),
      validLicenses[i],
      holderAddress
    )
    if(holdsLicense) {
      return true
    }
  }
  return false
}

async function getBalance (bondId, holderAddress) {
  init()
  await window.ethereum.enable()
  holderAddress = holderAddress ? holderAddress : await walletOrSigner.getAddress()
  const bondHash = ethers.utils.id(bondId)
  return (await autoBond.getBalance(bondHash, holderAddress)).toNumber()
}

// replaces buy
async function buyLicense(
  contributionId,
  submissionCb,
  confirmationCb,
  options = {},
  amount = "auto",
  maxPriceBP = 100 // number of basis points max should be above price shown
) {
  init()
  const bytes32Id = ethers.utils.formatBytes32String(contributionId)
  const purchasePrice = (
    await squadController.contributions(bytes32Id)
  ).purchasePrice
  const supply = await totalSupplyOf(contributionId)
  if (amount === "auto") {
    amount = linearCurveAmount(supply, purchasePrice)
  }
  const maxPriceBuffer = purchasePrice.mul(maxPriceBP).div(10000)
  const maxPrice = purchasePrice.add(maxPriceBuffer)
  console.log(
    "TEST squadController.buyLicense",
    contributionId,
    amount.toString(),
    maxPrice.toString()
  )
  const approveTx = await reserveToken.approve(bondingCurveFactoryAddress, maxPrice.mul(50))
  await provider.waitForTransaction(approveTx.hash)
  const tx = await squadController.buyLicense(
    bytes32Id,
    amount,
    maxPrice,
    {gasLimit: 4000000}
  )
  submissionCb(tx)
  return handleConfirmationCallback(tx.hash, confirmationCb)
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

async function redeemLicense(licenseId, submissionCb, confirmationCb) {
  init()
  const tx = await tokenClaimCheck.redeem(licenseId)
  submissionCb(tx)
  return handleConfirmationCallback(tx.hash, confirmationCb)
}

async function sellTokens(
  contributionId,
  amount,
  minPrice,
  submissionCb,
  confirmationCb
) {
  init()
  const tx = await squadController.sellTokens(
    ethers.utils.formatBytes32String(contributionId),
    amount,
    minPrice,
  )
  submissionCb(tx)
  return handleConfirmationCallback(tx.hash, confirmationCb)
}

// replaces sell
async function redeemAndSell(
  licenseId,
  minPrice,
  redeemSubmissionCb,
  redeemConfirmationCb,
  sellSubmissionCb,
  sellConfirmationCb,
) {
  init()
  const claim = await tokenClaimCheck.claims(licenseId)
  const contributionId = ethers.utils.parseBytes32String(
    await squadController.validLicenses(licenseId)
  )
  await redeemLicense(
    licenseId,
    redeemSubmissionCb,
    redeemConfirmationCb,
  )
  await sellTokens(
    contributionId,
    claim.amount,
    minPrice,
    sellSubmissionCb,
    sellConfirmationCb,
  )
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

// replaces getBuyPrice
async function priceOf(contributionId, amount) {
  init()
  const bytes32Id = ethers.utils.formatBytes32String(contributionId)
  const supply = await squadController.totalSupplyOf(bytes32Id)
  return await squadController.priceOf(bytes32Id, supply, amount)
}

async function getBuyPrice (units, bondId) {
  init()
  const bondHash = ethers.utils.id(bondId)
  return Number(await autoBond.getBuyPrice(units, bondHash))
}

async function linearCurvePrice(supply, amount) {
  init()
  return await linearCurve.price(supply, amount)
}

async function getBuyPriceFromCurve (supply, units, curveAddress) {
  init()
  if (curveAddress) {
    curve = new ethers.Contract(curveAddress, CurveJSON.abi, walletOrSigner)
  }
  return await curve.buyPrice(supply, units)
}

// replaces getSellPrice
async function sellPriceFor(contributionId, amount) {
  init()
  const supply = await totalSupplyOf(contributionId)
  return linearCurvePrice(supply.sub(amount), supply)
}

async function getSellPrice (units, bondId) {
  init()
  const bondHash = ethers.utils.id(bondId)
  return await autoBond.getSellPrice(units, bondHash)
}

// replaces getMarketCap
async function marketSize(contributionId) {
  init()
  const supply = totalSupplyOf(contributionId)
  return linearCurvePrice(0, supply)
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

async function walletAddress() {
  return walletOrSigner.getAddress()
}

function getEthers() {
  init()
  return ethers
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

  walletAddress,
  newContribution,
  networkFeeRate,
  totalSupplyOf,
  holdsLicenseFor,
  buyLicense,
  redeemLicense,
  sellTokens,
  redeemAndSell,
  priceOf,
  sellPriceFor,
  marketSize,
  getEthers,
  getValidLicenses
}
