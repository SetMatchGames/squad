require("dotenv").config()
const Web3 = require("web3")
const AutoBond = require("../../../curation/build/contracts/AutoBond.json")
const SimpleLinearCurve = require("../../../curation/build/contracts/SimpleLinearCurve.json")

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

  // Development env (non-browser)
  if (process.env.DEVELOPMENT === 'true') {
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
      gasPrice: '1000000'
    }
  }
  options = defaults
  console.log("init", options)
  console.log("the address is", AutoBond.address)
  autoBond = await new web3.eth.Contract(
    AutoBond.abi,
    process.env.AUTOBOND_ADDR,
    defaults
  )
}

async function newBond(addressOfCurve, bondId, initialBuyNumber) {
  await init()
  return await autoBond.methods.newBond(
    addressOfCurve,
    web3.utils.fromAscii(bondId),
    initialBuyNumber,
  ).send({})
}

async function getSupply(bondId) {
  await init()
  return await autoBond.methods.getSupply(
    web3.utils.fromAscii(bondId)
  ).call({})
}

async function getBalance(bondId, address) {
  await init()
  return await autoBond.methods.getBalance(
    web3.utils.fromAscii(bondId),
    address,
  )
}

async function buy(units, bondId, opts) {
  await init()
  let o = Object.assign(options, opts)
  console.log("opts", opts, options)
  console.log("options", o)
  return await autoBond.methods.buy(
    units,
    web3.utils.fromAscii(bondId),
  ).send(o)
}

async function sell(units, bondId) {
  await init()
  return await autoBond.methods.sell(
    units,
    web3.utils.fromAscii(bondId),
  ).send({})
}

async function getBuyPrice(units, bondId) {
  await init()
  return await autoBond.methods.getBuyPrice(
    units,
    web3.utils.fromAscii(bondId),
  ).call({})
}

async function getSellPrice(units, bondId) {
  await init()
  return await autoBond.methods.getSellPrice(
    units,
    web3.utils.fromAscii(bondId),
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



