const Web3 = require('web3')
const jsonfile = require('jsonfile')

const provider = new Web3.providers.WebsocketProvider('ws://localhost:8545')
const web3 = new Web3(provider, null, {
  transactionConfirmationBlocks: 1
})

const EthPolynomial = jsonfile.readFileSync("EthPolynomialCurvedToken.json")
const Factory = jsonfile.readFileSync("BondingCurveFactory.json")

const make = (factory, opts) => {
  return new Promise((resolve, reject) => {
    factory.methods.make().send(opts)
      .on('receipt', async (receipt) => {
        // TODO decouple this from the specifics of the contract
        const event = web3.eth.abi.decodeLog([
          {
            type: "address",
            name: "bondAddress"
          }
        ], receipt.events["0"].raw.data, receipt.events["0"].raw.topics)

        resolve(event.bondAddress)
      })
      .on('error', reject)
      .catch(reject)
  })
}

web3.eth.getAccounts().then(async ([alice, bob, ...accounts]) => {

  const defaults = {
    defaultAccount: alice,
    defaultGasPrice: '20000000000',
    defaultGas: 6721975
  }

  const factory = web3.eth.Contract(
    Factory.abi,
    '0xb359be611c67bbc09657f943362f6910d293b173',
    defaults
  )

  const bondAddress = await make(factory, defaults)
  const bond = web3.eth.Contract(
    EthPolynomial.abi,
    bondAddress,
    defaults
  )

  var price = await bond.methods.priceToMint(50).call({from: alice})
  console.log(price.toNumber())

  await bond.methods.mint(50).send(Object.assign(defaults, {value: price}))

  price = await bond.methods.priceToMint(50).call({from: alice})
  console.log(price.toNumber())

  await bond.methods.mint(50).send(Object.assign(defaults, {value: price}))

  price = await bond.methods.priceToMint(50).call({from: alice})
  console.log(price.toNumber())

  await bond.methods.mint(50).send(Object.assign(defaults, {value: price}))

  price = await bond.methods.priceToMint(50).call({from: alice})
  console.log(price.toNumber())
})

