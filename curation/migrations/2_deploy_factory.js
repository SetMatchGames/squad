const BondingCurveFactory = artifacts.require("BondingCurveFactory")

module.exports = function(deployer) {
  deployer.deploy(BondingCurveFactory)
}
