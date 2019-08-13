const AutoBond = artifacts.require("AutoBond")
const SimpleLinearCurve = artifacts.require("SimpleLinearCurve")

class MissingError extends Error {
  constructor(message) {
    super(message); // (1)
    this.name = "MissingError"; // (2)
  }
}

async function throws(f, message) {
  try {
    await f()
    throw new MissingError()
  } catch(e) {
    if (e instanceof MissingError) {
      assert.fail(message)
    }
  }
}

contract("AutoBond", ([alice, bob, ...accounts]) => {
  let curve
  let autoBond

  beforeEach(async () => {
    autoBond = await AutoBond.new()
    curve = await SimpleLinearCurve.new()
  })

  it("should know true is true", () => {
    assert.equal(true, true)
  })

  it("creates functioning SimplerLinear bonds", async () => {
    const bondAId = "0x12ad4"
    const bondBId = "0xfffff"

    // Alice can create bond A
    await autoBond.newBond(curve.address, bondAId, 0, {from: alice})
    // Bob fails to buy 200 for the price of 199
    throws(
      async () => {
        await autoBond.buy(
          200,
          bondAId,
          {from: bob, value: await curve.buyPrice(0, 199)}
        )
      },
      "Failed: Bought 200 from bond A for the price of 199."
    )

    // Bob buys 200 for the price of 200
    await autoBond.buy(
      200,
      bondAId,
      {from: bob, value: await curve.buyPrice(0, 200)}
    )

    // Bob creates bond B and buys 100 for the price of 100
    await autoBond.newBond(
      curve.address,
      bondBId,
      100,
      {from: bob, value: await curve.buyPrice(0, 100)}
    )

    // Alice fails to buy 100 more for the price of 99 more
    throws(
      async () => {
        await autoBond.buy(
          100,
          bondBId,
          {from: alice, value: await curve.buyPrice(100, 99)}
        )
      },
      "Failed: Bought 100 from bond B for the price of 99."
    )

    // Alice buys 100 more for the price of 100 more
    await autoBond.buy(
      100,
      bondBId,
      {from: alice, value: await curve.buyPrice(100, 100)}
    )

  })
})
