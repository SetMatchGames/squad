const fs = require("fs")
const AutoBond = artifacts.require("AutoBond")
const SimpleLinearCurve = artifacts.require("SimpleLinearCurve")

let curationConfig = { contracts: {} }

module.exports = function(deployer) {
  deployer.deploy(AutoBond).then(c => {
    // write address to config file
    addToConfig("autoBond", c.address)
    fs.writeFileSync("curation-config.json", JSON.stringify(curationConfig))
  })
  deployer.deploy(SimpleLinearCurve).then(c => {
    // write address to config file
    addToConfig("simpleLinearCurve", c.address)
    fs.writeFileSync("curation-config.json", JSON.stringify(curationConfig))
  })
};

function addToConfig(name, address) {
  const network = process.env.NETWORK
  curationConfig["network"] = network
  curationConfig.contracts[name] = address
}
