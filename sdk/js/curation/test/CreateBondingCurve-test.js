const BondingCurveFactory = artifacts.require("BondingCurveFactory")
const EthPolynomialCurvedToken = artifacts.require("EthPolynomialCurvedToken")
const jsonfile = require('jsonfile')

contract("BondingCurveFactory", ([alice, bob, carol, vick, ...accounts]) => {
  let bondingCurveFactory

  before(async () => {
    bondingCurveFactory = await BondingCurveFactory.new()
  })

  const EthPolyABI = jsonfile.readFileSync("build/contracts/EthPolynomialCurvedToken.json").abi

  it("Creates new bonding curves", async () => {
    const b1Address = await bondingCurveFactory.make.call()
    console.log(b1Address, web3.isAddress([b1Address]))
    const b1 = EthPolynomialCurvedToken.at(b1Address)
    const b1Balance = await b1.poolBalance()
    console.log(b1Balance)
    const b2Address = bondingCurveFactory.make()
    const b2 = web3.eth.contract(EthPolyABI).at(b2Address)
    const b2Balance = b2.poolBalance()

    b1.mint(50, {value: await b1.priceToMint.call(50)})
    b2.mint(500, {value: await b1.priceToMint.call(500)})

    assert(b1.priceToMint(1) > b2.priceToMint(1))
  })
})
