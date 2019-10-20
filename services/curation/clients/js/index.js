const Web3 = require("web3")
const AutoBond = require("../../../curation/build/contracts/AutoBond.json")
const config = require("../../curation-config.json")
const contractAddresses = config.contracts
const network = config.network

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
        console.log('Minting, buying, or selling tokens requires a connection to Ethereum. \
                     Consider installing/logging into the Metamask browser extension.')
    }
}

let web3
let accounts
let autoBond
let options

async function init(defaults) {
  if (web3 !== undefined) { return }
  console.log("running init...")

  // Development env (non-browser)
  if (network === 'development') {
    // add ganache web3
    const provider = new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545')
    web3 = new Web3(provider)
  } else {
    await addWeb3()
    web3 = window.web3
  }

  accounts = await web3.eth.getAccounts()

  if (defaults === undefined) {
    defaults = {
      from: accounts[0],
      gas: 900000
    }
  }
  options = defaults
  autoBond = await new web3.eth.Contract(
    AutoBond.abi,
    contractAddresses.autoBond,
    defaults
  )
  console.log("init finished", web3)
}

async function newBond(addressOfCurve = contractAddresses.simpleLinearCurve, bondId, initialBuyNumber, opts = {}) {
  await init()
  let bondSha = web3.utils.sha3(bondId)
  let o = Object.assign({}, options, opts)
  let curve = await autoBond.methods.getCurve(bondSha).call({})
  if (curve === '0x0000000000000000000000000000000000000000') {
    return await autoBond.methods.newBond(
      addressOfCurve,
      bondSha,
      initialBuyNumber,
    ).send(o)
  }
  throw "Bond already exists."
}

async function getSupply(bondId) {
  await init()
  let bondSha = web3.utils.sha3(bondId)
  return await autoBond.methods.getSupply(bondSha).call({})
}

async function getBalance(bondId, holderAddress) {
  await init()
  let bondSha = web3.utils.sha3(bondId)
  return await autoBond.methods.getBalance(
    bondSha,
    holderAddress,
  ).call({})
}

async function buy(units, bondId, opts) {
  await init()
  let bondSha = web3.utils.sha3(bondId)
  let o = Object.assign({}, options, opts)
  return await autoBond.methods.buy(
    units,
    bondSha,
  ).send(o)
}

async function sell(units, bondId, opts) {
  await init()
  let bondSha = web3.utils.sha3(bondId)
  let o = Object.assign({}, options, opts)
  return await autoBond.methods.sell(
    units,
    bondSha,
  ).send(o)
}

async function getBuyPrice(units, bondId) {
  await init()
  let bondSha = web3.utils.sha3(bondId)
  return await autoBond.methods.getBuyPrice(
    units,
    bondSha,
  ).call({})
}

async function getSellPrice(units, bondId) {
  await init()
  let bondSha = web3.utils.sha3(bondId)
  return await autoBond.methods.getSellPrice(
    units,
    bondSha,
  ).call({})
}

module.exports = {
  init,
  newBond,
  getSupply,
  getBalance,
  getBuyPrice,
  getSellPrice,
  buy,
  sell
}



