const AutoBond = artifacts.require("AutoBond")
const SimpleLinearCurve = artifacts.require("SimpleLinearCurve")

contract("AutoBond", ([alice, bob, ...accounts]) => {
  let curve
  let autoBond

  async function simpleCurvePrice(supply, units) {
    return await curve.buyPrice(supply, units)
  }

  beforeEach(async () => {
    autoBond = await AutoBond.new()
    curve = await SimpleLinearCurve.new()
  })

  it("should know true is true", () => {
    assert.equal(true, true)
  })
  
  // alice can create bond A
  it("creates functioning SimplerLinear bonds", async () => {
    const bondId1 = "0x12ad4"
    const bondId2 = "0xfffff"
    await autoBond.newBond(curve.address, bondId1, 0, {from: alice})
    try {
      await autoBond.buy(200, bondId1, {from: bob, value: await simpleCurvePrice(0, 199)})
      assert.fail("Failed: Bought 200 from bond A for the price of 199.")
    } catch(e) {}
    await autoBond.buy(200, bondId1, {from: bob, value: await simpleCurvePrice(0, 200)})
    await autoBond.newBond(curve.address, bondId2, 100, {from: bob, value: await simpleCurvePrice(0, 100)})
    try {
      await autoBond.buy(200, bondId2, {from: alice, value: await simpleCurvePrice(100, 199)})
      assert.fail("Failed: Bought 200 from bond B for the price of 199.")
    } catch(e) {}
    await autoBond.buy(200, bondId2, {from: alice, value: await simpleCurvePrice(100, 200)})
  })

  // bob can buy the first 2 units of bond A for 3 wei

  // bob can create bond B buy the first 2 units for 3 wei

  // alice can buy the next 2 units of bond B for 7 wei

  // bob can sell a unit of bond B for 4 wei

  // alice can sell 2 units of bond B for 5 wei

  // bob can sell 1 unit of bond b for 1 wei

  // neither alice nor bob can sell any more
})
