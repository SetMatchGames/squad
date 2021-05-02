/* global require module artifacts */

const AutoBond = artifacts.require('AutoBond')
const SimpleLinearCurve = artifacts.require('SimpleLinearCurve')

module.exports = function (deployer, network) {
  deployer.deploy(AutoBond)
  deployer.deploy(SimpleLinearCurve)
}
