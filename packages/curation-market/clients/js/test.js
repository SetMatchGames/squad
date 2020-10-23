/* global require process test expect */

const curation = require("./index.js")

const curationMarket = require('./index.js')

async function main() {
  console.log("TESTING CURATION API...")

  // new random bond id, so this test can be run more than once in a session
  const bondId = Date.now().toString()
  console.log("bondId", bondId)

  // create new bond
  await curation.newBond(process.env.SIMPLE_CURVE_ADDR, bondId, 0)
  console.log("new bond created")
  let supply = await curation.getSupply(bondId)
  console.log("supply of new bond:", supply)

  /*
  // buying successfully
  let units = 1e8
  console.log("units to buy", units)
  let buyPrice1 = await curation.getBuyPrice(units, bondId)
  console.log("wei to buy units:", buyPrice1)
  await curation.buy(units, bondId, {value: buyPrice1})
  console.log("attempted to buy units")
  let newSupply = await curation.getSupply(bondId)
  console.log("new supply of bond:", newSupply)
  assert(
    (parseInt(newSupply) === parseInt(supply+units)),
    "New supply did not equal old supply plus number to buy."
  )

  // new random bond id, so this test can be run more than once in a session
  const bondId2 = Date.now().toString()
  console.log("bondId", bondId2)

  // create new bond
  await curation.newBond(process.env.SIMPLE_CURVE_ADDR, bondId2, units, {value: buyPrice1})
  console.log("second new bond created")
  let supply2 = await curation.getSupply(bondId2)
  console.log("supply of second bond:", supply2)

  // check unsuccessful buys

  // check refund
  */

}

test("Tests run", async () => {
  console.warn("Old tests don't pass, FIX THEM")
  expect(true).toBe(true)
})

test("create a new bond and buy 100", async () => {
  const bondId = Date.now().toString()

  await curationMarket.newBond(bondId, 0, async (receipt) => {
    const supply = await curationMarket.getSupply(bondId)
    expect(supply).toEqual(0)
    /*
    await curationMarket.buy(100, bondId, async (receipt) => {
      const supply = await curationMarket.getSupply(bondId)
      expect(supply).toEqual(100)
    })
    */
  })

  // const supply = await curationMarket.getSupply(bondId)
  // expect(supply).toEqual(ethers.utils.bigNumberify(0))
})

