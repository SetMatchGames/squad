/* global contract assert artifacts it beforeEach */

const AutoBond = artifacts.require('AutoBond')
const SimpleLinearCurve = artifacts.require('SimpleLinearCurve')

class MissingError extends Error {
  constructor (message) {
    super(message) // (1)
    this.name = 'MissingError' // (2)
  }
}

async function throws (f, message) {
  try {
    await f()
    throw new MissingError()
  } catch (e) {
    if (e instanceof MissingError) {
      assert.fail(message)
    }
  }
}

contract('AutoBond', ([alice, bob, ...accounts]) => {
  let curve
  let autoBond

  beforeEach(async () => {
    autoBond = await AutoBond.new()
    curve = await SimpleLinearCurve.new()
  })

  it('should know true is true', () => {
    assert.equal(true, true)
  })

  it('creates functioning SimplerLinear bonds', async () => {
    const bondAId = '0x12ad4'
    const bondBId = '0xfffff'

    // Alice can create bond A
    await autoBond.newBond(curve.address, bondAId, 0, { from: alice })
    // supply of A should be 0
    assert.equal((await autoBond.bonds(bondAId)).supply, 0)
    assert.equal(await autoBond.getSupply(bondAId), 0)
    // assert.equal(await autoBond.getBuyPrice(199, bondAId), await curve.buyPrice(0, 199))

    // Bob fails to buy 200 for the price of 199
    let price = await autoBond.getBuyPrice(199, bondAId)
    console.log('Got price for 199:', price)
    throws(
      async () => {
        await autoBond.buy(
          200,
          bondAId,
          { from: bob, value: price }
        )
      },
      'Failed: Bought 200 from bond A for the price of 199.'
    )

    // Bob buys 200 for the price of 200
    price = await autoBond.getBuyPrice(200, bondAId)
    console.log('Got price for 200:', price)
    await autoBond.buy(
      200,
      bondAId,
      { from: bob, value: price }
    )

    // supply of A should be 200
    assert.equal((await autoBond.bonds(bondAId)).supply, 200)
    assert.equal(await autoBond.getSupply(bondAId), 200)

    // Bob should have a balance of 200 in A
    assert.equal(await autoBond.getBalance(bondAId, bob), 200)

    // Bob creates bond B and buys 100 for the price of 100
    await autoBond.newBond(
      curve.address,
      bondBId,
      100,
      { from: bob, value: await curve.buyPrice(0, 100) }
    )

    // supply of B should be 100 and should be bobs
    assert.equal(await autoBond.getSupply(bondBId), 100)
    assert.equal(await autoBond.getBalance(bondBId, bob), 100)

    // Alice fails to buy 100 more for the price of 99 more
    throws(
      async () => {
        await autoBond.buy(
          100,
          bondBId,
          { from: alice, value: await autoBond.getBuyPrice(99, bondBId) }
        )
      },
      'Failed: Bought 100 from bond B for the price of 99.'
    )

    // Alice buys 100 more for the price of 100 more
    await autoBond.buy(
      100,
      bondBId,
      { from: alice, value: await autoBond.getBuyPrice(100, bondBId) }
    )

    // bond B supply should be 200 but alice should have 100, so should bob
    assert.equal(await autoBond.getSupply(bondBId), 200)
    assert.equal(await autoBond.getBalance(bondBId, alice), 100)
    assert.equal(await autoBond.getBalance(bondBId, bob), 100)

    await throws(
      async () => { await autoBond.sell(101, bondBId, { from: bob }) },
      'Failed: was allowed to sell more than balance'
    )

    // bob should be able to sell 100
    await autoBond.sell(100, bondBId, { from: bob })
    // bob should have no balance left
    assert.equal(await autoBond.getBalance(bondBId, bob), 0)
    // bob should not be able to sell any more
    await throws(
      async () => { await autoBond.sell(1, bondBId, { from: bob }) },
      'Failed: was allowed to sell 1 with zero balance'
    )
  })
})
