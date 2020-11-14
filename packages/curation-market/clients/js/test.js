/* global test expect beforeEach */
// NOTE: if running these tests multiple times without restarting the local network,
// the tests will take longer each time, leading them to eventually fail.

const curationMarket = require('./index.js')
const crypto = require('crypto')

const feeRate = 1000
const purchasePrice = 10
let purchases = 0
const expectedSP = purchasePrice - purchasePrice * feeRate / 10000
let contributionId

beforeEach(async () => {
  const def = { date: Date.now() }
  contributionId = '0x' + crypto.createHash('sha256').update(JSON.stringify(def)).digest('hex')
  await curationMarket.newContribution(
    contributionId,
    feeRate,
    purchasePrice,
    () => {},
    () => {}
  )
  await curationMarket.buyLicense(
    contributionId,
    () => {},
    () => {}
  )
  purchases += 1
})

test('tests run', () => {
  expect(true).toBe(true)
})

test('correctly predict contribution sell price', async () => {
  const licenses = await curationMarket.getValidLicenses()
  const returnedSP = Number(licenses[contributionId][0].sellAmount)
  expect(returnedSP).toBe(expectedSP)
})

test('contribution sells for expected amount', async () => {
  const initBalance = Number(await curationMarket.reserveBalanceOf())
  const licenses = await curationMarket.getValidLicenses()
  const licenseId = licenses[contributionId][0].licenseId
  const returnedSP = Number(licenses[contributionId][0].sellAmount)
  const expectedBalance = initBalance + returnedSP
  await curationMarket.redeemAndSell(
    licenseId,
    expectedSP,
    () => {},
    () => {},
    () => {},
    () => {}
  )
  const newBalance = Number(await curationMarket.reserveBalanceOf())
  expect(newBalance).toEqual(expectedBalance)
})

test('finds held licenses for contribution', async () => {
  const bool = await curationMarket.holdsLicenseFor(contributionId)
  expect(bool).toBe(true)
})

test('finds lack of licenses for contribution', async () => {
  const def = { date: Date.now() }
  const newContributionId = '0x' + crypto.createHash('sha256').update(JSON.stringify(def)).digest('hex')
  await curationMarket.newContribution(
    newContributionId,
    feeRate,
    purchasePrice,
    () => {},
    () => {}
  )
  const bool = await curationMarket.holdsLicenseFor(newContributionId)
  expect(bool).toBe(false)
})

test('finds correct market size', async () => {
  const expectedMarketSize = purchasePrice
  const marketSize = Number(await curationMarket.marketSize(contributionId))
  expect(marketSize).toBe(expectedMarketSize)
})

test('finds correct purchase price', async () => {
  const foundPP = Number(await curationMarket.purchasePriceOf(contributionId))
  expect(foundPP).toBe(purchasePrice)
})

test('finds correct fee rate', async () => {
  const foundFeeRate = Number(await curationMarket.feeOf(contributionId))
  expect(foundFeeRate).toBe(feeRate)
})

// Will only work on first test run after starting local network
test('finds correct withdraw amount', async () => {
  const expectedWA = purchases * purchasePrice * feeRate / 10000
  const returnedWA = Number(await curationMarket.withdrawAmount())
  expect(returnedWA).toBe(expectedWA)
})

// Will only work on first test run after starting local network
test('withdraws correct amount', async () => {
  const initBalance = Number(await curationMarket.reserveBalanceOf())
  const expectedWA = purchases * purchasePrice * feeRate / 10000
  const expectedBalance = initBalance + expectedWA
  await curationMarket.withdraw(
    () => {},
    () => {}
  )
  const newBalance = Number(await curationMarket.reserveBalanceOf())
  expect(newBalance).toBe(expectedBalance)
})
