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

async function newBond(addressOfCurve, /* bytes32 */ bondId, initialBuyNumber) {
    let web3
    // Development env (non-browser)
    if (process.env.DEVELOPMENT === 'true') {
        // add ganache web3
        const provider = new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545')
        web3 = new Web3(provider)
    } else {
        await addWeb3()
        web3 = window.web3
    }

    const accounts = await web3.eth.getAccounts()

    let autoBond = await new web3.eth.Contract(
        AutoBond.abi,
        process.env.AUTOBOND_ADDR,
        {
            from: accounts[0],
            gasPrice: '1000000'
        }
    )

    console.log(autoBond.methods)

    return await autoBond.methods.newBond(addressOfCurve, bondId, initialBuyNumber)

}

module.exports = {
    newBond
}



