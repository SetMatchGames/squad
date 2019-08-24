const fs = require("fs")
const AutoBond = artifacts.require("AutoBond")
const SimpleLinearCurve = artifacts.require("SimpleLinearCurve")

module.exports = function(deployer) {
  deployer.deploy(AutoBond).then(c => {
    // write AutoBond address to .env file
    fs.writeFileSync(
      '.env',
      `AUTOBOND_ADDR=${c.address}`,
      (err) => {
        if (err) throw err
        console.log('AutoBond address saved to .env')
      }
    )
  })
  deployer.deploy(SimpleLinearCurve).then(c => {
    fs.appendFileSync(
      '.env',
      `\nSIMPLE_CURVE_ADDR=${c.address}`,
      (err) => {
        if (err) throw err
        console.log('AutoBond address saved to .env')
      }
    )
  })
};
