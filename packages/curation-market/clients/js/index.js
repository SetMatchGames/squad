/* global require module web3 */

const ethers = require('ethers')

const SquadControllerJSON = require('./artifacts/SquadController.json')
const TokenClaimCheckJSON = require('./artifacts/TokenClaimCheck.json')
const AccountingJSON = require('./artifacts/Accounting.json')
const LinearCurveJSON = require('./artifacts/LinearCurve.json')
const BondingCurveFactoryJSON = require('./artifacts/BondingCurveFactory.json')
const ERC20JSON = require('./artifacts/ERC20.json')

/* Ropsten addresses */

const squadControllerAddress = '0xddBc988B7a79915Cf50C8a85a76cd107BC787496'
const tokenClaimCheckAddress = '0x87Fe1061b0f97A6ea260781647b7704E0f4EA7a2'
const linearCurveAddress = '0x8907d80aFCA7b80E27f00AFab4c8Ad436Fe67862'
const bondingCurveFactoryAddress = '0xd2c494178351BB70E051831d160f9D39a59756a5'
const reserveTokenAddress = '0x7E0480Ca9fD50EB7A3855Cf53c347A1b4d6A2FF5'
const accountingAddress = '0x013b42567fB46ca97f09F5fd7594a70307DA1700'
/*
ClaimCheck deployed to: 0x87Fe1061b0f97A6ea260781647b7704E0f4EA7a2
LinearCurve deployed to: 0x8907d80aFCA7b80E27f00AFab4c8Ad436Fe67862
BondingCurveFactory deployed to: 0xd2c494178351BB70E051831d160f9D39a59756a5
SquadController deployed to: 0xddBc988B7a79915Cf50C8a85a76cd107BC787496
Accounting deployed to: 0x013b42567fB46ca97f09F5fd7594a70307DA1700
*/

/* localhost addresses, to be swapped out */
/*
const squadControllerAddress = '0x0165878A594ca255338adfa4d48449f69242Eb8F'
const tokenClaimCheckAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'
const linearCurveAddress = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
const bondingCurveFactoryAddress = '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'
const reserveTokenAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0'
const accountingAddress = '0x3B02fF1e626Ed7a8fd6eC5299e2C54e1421B626B'
*/
/*
const networkIds = {
  'ropsten': 3
}
*/

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

const network = process.env.NETWORK
const devUrl = 'http://localhost:8545'

let initialized = false
let provider
let walletOrSigner
let linearCurve
let defaults

let squadController
let tokenClaimCheck
let bondingCurveFactory
let reserveToken
let accounting

function init (defaults) {
  if (initialized) {
    return walletOrSigner
  }
  console.log('Initializing...')

  switch (network) {
    case 'development': {
      provider = new ethers.providers.JsonRpcProvider(devUrl)
      walletOrSigner = provider.getSigner(0)
      break
    }
    default: {
      console.log('Trying to make provider...')
      provider = new ethers.providers.Web3Provider(web3.currentProvider)
      walletOrSigner = provider.getSigner()
    }
  }

  linearCurve = new ethers.Contract(linearCurveAddress, LinearCurveJSON.abi, walletOrSigner)
  bondingCurveFactory = new ethers.Contract(bondingCurveFactoryAddress, BondingCurveFactoryJSON.abi, walletOrSigner)
  squadController = new ethers.Contract(
    squadControllerAddress, SquadControllerJSON.abi, walletOrSigner
  )
  tokenClaimCheck = new ethers.Contract(
    tokenClaimCheckAddress, TokenClaimCheckJSON.abi, walletOrSigner
  )
  reserveToken = new ethers.Contract(reserveTokenAddress, ERC20JSON.abi, walletOrSigner)
  accounting = new ethers.Contract(accountingAddress, AccountingJSON.abi, walletOrSigner)

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
  constructor (message) {
    super(message)
    this.name = 'BondAlreadyExists'
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
  metadata,
  submissionCb,
  confirmationCb,
  options
) {
  init()
  const walletAddress = await walletOrSigner.getAddress()
  const fullOptions = Object.assign({}, defaults, options, { gasLimit: 4712357 })
  const name = `Squad Chess ${contributionId}`
  const symbol = `sc${contributionId.substring(0, 3).toUpperCase()}`
  purchasePrice = ethers.utils.parseEther(`${purchasePrice}`)
  metadata = JSON.stringify(metadata)
  if (await squadController.exists(contributionId)) {
    // throw new BondAlreadyExists('Contribution ID already exists')
    console.error('BondAlreadyExists: Contribution ID already exists')
    return
  }
  const tx = await squadController.newContribution(
    contributionId,
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

async function totalSupplyOf (contributionId) /* returns BigNumber */ {
  init()
  return await squadController.totalSupplyOf(contributionId)
}

async function getLicenseInfo (licenseId) {
  const contributionId = await squadController.validLicenses(licenseId)
  if (contributionId === '') {
    return false
  }
  const [beneficiary, feeRate, purchasePrice] = await squadController.contributions(contributionId)
  const contribution = { beneficiary, feeRate, purchasePrice }
  if (contribution.beneficiary === ethers.constants.AddressZero) {
    return false
  }
  const [token, amount] = await tokenClaimCheck.claims(licenseId)
  const claim = { token, amount }
  const sellStrings = (await licenseSellPrice(licenseId, feeRate)).split('.')
  const sellAmount = `${sellStrings[0]}.${sellStrings[1].slice(0, 2)}`
  if (token === ethers.constants.AddressZero) {
    return false
  }
  return { licenseId, contributionId, contribution, claim, sellAmount }
}

/**
 * getValidLicenses returns all valid licenses held by `holderAddress`
 *
 * {
 *   licenseId: licenseInfo,
 *   contributionId: [licenseInfo]
 * }
 */

async function getValidLicenses (holderAddress) {
  init()
  if (!holderAddress) { holderAddress = await walletOrSigner.getAddress() }
  const licenseBalance = parseInt((await tokenClaimCheck.balanceOf(holderAddress)).toString(), 10)
  const licenseIds = await Promise.all(
    [...Array(licenseBalance).keys()].map(async (i) => {
      return await tokenClaimCheck.tokenOfOwnerByIndex(holderAddress, i)
    })
  )
  const validLicenses = {}
  await Promise.all(licenseIds.map(async (licenseId) => {
    const licenseInfo = await getLicenseInfo(licenseId)
    if (!licenseInfo) {
      // NFT is not a valid squad license
      return
    }
    validLicenses[licenseId] = licenseInfo
    validLicenses[licenseInfo.contributionId] = [
      licenseInfo, ...(validLicenses[licenseInfo.contributionId] || [])
    ]
  }))
  return validLicenses
}

async function holdsLicenseFor (contributionId, holderAddress) {
  init()
  if (!holderAddress) { holderAddress = await walletOrSigner.getAddress() }
  const validLicenses = (await getValidLicenses(holderAddress))[contributionId] || []
  for (let i = 0; i < validLicenses.length; i++) {
    const holdsLicense = await squadController.holdsLicense(
      contributionId,
      validLicenses[i].licenseId,
      holderAddress
    )
    if (holdsLicense) {
      return true
    }
  }
  return false
}

async function buyLicense (
  contributionId,
  submissionCb,
  confirmationCb,
  amount = 'auto',
  maxPriceBP = 100 // number of basis points max should be above price shown
) {
  init()
  const purchasePrice = (
    await squadController.contributions(contributionId)
  ).purchasePrice
  let buyPrice = purchasePrice
  const supply = await totalSupplyOf(contributionId)
  if (amount === 'auto') {
    amount = linearCurveAmount(supply, purchasePrice)
  } else {
    buyPrice = await priceOf(contributionId, amount)
    if (buyPrice.lt(purchasePrice)) {
      throw new Error('amount too low to buy a valid license')
    }
  }
  const maxPriceBuffer = buyPrice.mul(maxPriceBP).div(10000)
  const maxPrice = buyPrice.add(maxPriceBuffer)
  const approveTx = await reserveToken.approve(bondingCurveFactoryAddress, maxPrice)
  await provider.waitForTransaction(approveTx.hash)
  const tx = await squadController.buyLicense(
    contributionId,
    amount,
    maxPrice,
    { gasLimit: 4000000 }
  )
  submissionCb(tx)
  return handleConfirmationCallback(tx.hash, confirmationCb)
}

async function redeemLicense (licenseId, submissionCb, confirmationCb) {
  init()
  const tx = await tokenClaimCheck.redeem(licenseId)
  submissionCb(tx)
  return handleConfirmationCallback(tx.hash, confirmationCb)
}

async function sellTokens (
  contributionId,
  amount,
  minPrice,
  submissionCb,
  confirmationCb
) {
  init()
  const amountUnits = ethers.utils.parseUnits(amount)
  const minPriceUnits = ethers.utils.parseUnits(minPrice)
  const tx = await squadController.sellTokens(
    contributionId,
    amountUnits,
    minPriceUnits
  )
  submissionCb(tx)
  return handleConfirmationCallback(tx.hash, confirmationCb)
}

async function redeemAndSell (
  licenseId,
  minPrice,
  redeemSubmissionCb,
  redeemConfirmationCb,
  sellSubmissionCb,
  sellConfirmationCb
) {
  init()
  const claim = await tokenClaimCheck.claims(licenseId)
  const contributionId = await squadController.validLicenses(licenseId)
  await redeemLicense(
    licenseId,
    redeemSubmissionCb,
    redeemConfirmationCb
  )
  console.log('sell pricing', await sellPriceFor(contributionId, claim.amount, 100))
  await sellTokens(
    contributionId,
    ethers.utils.formatEther(claim.amount),
    String(minPrice * 0.96),
    sellSubmissionCb,
    sellConfirmationCb
  )
}

async function purchasePriceOf (contributionId) {
  init()
  return ethers.utils.formatEther(
    (await squadController.contributions(contributionId)).purchasePrice
  )
}

async function feeOf (contributionId) {
  init()
  return (await squadController.contributions(contributionId)).feeRate
}

async function priceOf (contributionId, amount) {
  init()
  const supply = await squadController.totalSupplyOf(contributionId)
  console.log('real supply:', supply.toString())
  return await squadController.priceOf(contributionId, supply, amount)
}

async function linearCurvePrice (supply /* big num */, amount /* big num */) {
  init()
  return ethers.utils.formatEther(await linearCurve.price(supply, amount))
}

async function sellPriceFor (contributionId, amount /* big num */, feeRate) {
  init()
  const supply = await squadController.totalSupplyOf(contributionId)
  let price = await linearCurvePrice(supply.sub(amount), amount)
  price = ethers.utils.parseEther(price)
  const fee = price.mul(feeRate).div(10000)
  price = price.sub(fee)
  return ethers.utils.formatEther(price)
}

async function licenseSellPrice (licenseId, feeRate) {
  init()
  const claim = await tokenClaimCheck.claims(licenseId)
  const contributionId = await squadController.validLicenses(licenseId)
  return await sellPriceFor(contributionId, claim.amount, feeRate)
}

async function marketSize (contributionId) {
  init()
  const supply = await totalSupplyOf(contributionId)
  return linearCurvePrice(0, supply)
}

function handleConfirmationCallback (txHash, callback) {
  return provider.waitForTransaction(txHash).then((receipt) => {
    callback(receipt)
  })
}

async function walletAddress () {
  return walletOrSigner.getAddress()
}

function getEthers () {
  init()
  return ethers
}

async function withdrawAmount (address) {
  init()
  if (!address) { address = await walletOrSigner.getAddress() }
  const raw = ethers.utils.formatEther(await accounting.accounts(address))
  return parseFloat(Number(raw)).toPrecision(4)
}

async function withdraw (submissionCb, confirmationCb) {
  init()
  const tx = await squadController.withdraw(await walletOrSigner.getAddress())
  submissionCb(tx)
  return handleConfirmationCallback(tx.hash, confirmationCb)
}

async function reserveBalanceOf (address) {
  init()
  if (!address) { address = await walletOrSigner.getAddress() }
  const rawBalance = await reserveToken.balanceOf(address)
  return ethers.utils.formatEther(rawBalance)
}

module.exports = {
  init,
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
  getValidLicenses,
  linearCurveAmount,
  linearCurvePrice,
  purchasePriceOf,
  feeOf,
  licenseSellPrice,
  withdrawAmount,
  withdraw,
  reserveBalanceOf
}
