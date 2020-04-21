/* global web3 ethereum require module */

const Web3 = require("web3")
const AutoBondJSON = require("../../app/build/contracts/AutoBond.json")
const SimpleLinearCurveJSON = require(
  "../../app/build/contracts/SimpleLinearCurve.json"
)
const contract = require("@truffle/contract")

async function addWeb3() {
    // Modern dapp browsers...
    if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
            // Request account access if needed
            await ethereum.enable();
        } catch (error) {
            // User denied account access...
            console.log(error)
        }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
        window.web3 = new Web3(web3.currentProvider)
    }
    // Non-dapp browsers...
    else {
      console.log(
        'Minting, buying, or selling tokens requires a connection to Ethereum. \
         Consider installing/logging into the Metamask browser extension.'
      )
    }
}

let web3
let accounts
let autoBond
let simpleLinearCurve
let options

// TODO race condition bug when init is called concurrently for the first time
// consider requiring an explicit call to init by client code
async function init(defaults) {
  if (web3 !== undefined) { return }
  console.log("running init...")

  await addWeb3()
  web3 = window.web3

  accounts = await web3.eth.getAccounts()

  if (defaults === undefined) {
    defaults = {
      from: accounts[0],
      gas: 900000
    }
  }
  options = defaults
  console.log(AutoBondJSON)
  console.log(SimpleLinearCurveJSON)
  autoBond = await contract(AutoBondJSON).deployed()
  simpleLinearCurve = await contract(SimpleLinearCurveJSON).deployed()
  console.log("init finished")
}

class BondAlreadyExists extends Error {
  constructor(message) {
    super(message)
    this.name = "BondAlreadyExists"
  }
}

async function newBond(
  addressOfCurve = simpleLinearCurve.address,
  bondId,
  initialBuyNumber,
  opts = {}
) {
  await init()
  let bondSha = web3.utils.sha3(bondId)
  let o = Object.assign({}, options, opts)
  let curve = await autoBond.getCurve(bondSha)
  if (curve === '0x0000000000000000000000000000000000000000') {
    return await autoBond.newBond(
      addressOfCurve,
      bondSha,
      initialBuyNumber,
    )
  }
  throw new BondAlreadyExists(`Bond ${bondId} already exists.`)
}

async function getSupply(bondId) {
  await init()
  let bondSha = web3.utils.sha3(bondId)
  return await autoBond.getSupply(bondSha)
}

async function getBalance(bondId, holderAddress) {
  await init()
  let bondSha = web3.utils.sha3(bondId)
  return await autoBond.getBalance(
    bondSha,
    holderAddress,
  )
}

async function buy(units, bondId, opts) {
  await init()
  let bondSha = web3.utils.sha3(bondId)
  let o = Object.assign({}, options, opts)
  return await autoBond.buy(
    units,
    bondSha,
  )
}

async function sell(units, bondId, opts) {
  await init()
  let bondSha = web3.utils.sha3(bondId)
  let o = Object.assign({}, options, opts)
  return await autoBond.sell(
    units,
    bondSha,
  )
}

async function getBuyPrice(units, bondId) {
  await init()
  let bondSha = web3.utils.sha3(bondId)
  return await autoBond.getBuyPrice(
    units,
    bondSha,
  )
}

async function getSellPrice(units, bondId) {
  await init()
  let bondSha = web3.utils.sha3(bondId)
  return await autoBond.getSellPrice(
    units,
    bondSha,
  )
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



