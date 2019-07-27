const BondingCurveFactory = artifacts.require("BondingCurveFactory")
const fs = require("fs")

module.exports = function(deployer) {
  deployer.deploy(BondingCurveFactory).then(() => {
    fs.writeFile(".env", `export FACTORY_ADDR=${BondingCurveFactory.address}`, console.error)
  })
}