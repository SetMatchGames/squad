require("dotenv").config()
const curation = require("./index")

async function main() {

//  console.log(
//    await curation.newBond(process.env.SIMPLE_CURVE_ADDR, 'bondId', 0)
//  )

  console.log("supply", await curation.getSupply('bondId'))

  let units = 1e8
  console.log("units", units)
  let buyPrice = await curation.getBuyPrice(units.toString(), 'bondId')
  console.log(buyPrice / 1e18)
  console.log(await curation.buy(units.toString(), 'bondId', {value: buyPrice}))
  console.log("supply", await curation.getSupply('bondId'))
}

main()
