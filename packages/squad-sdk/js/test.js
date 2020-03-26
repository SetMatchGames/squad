/* global test require expect jest */

const squad = require('./index')

// mock the curation market and metastore
const curation = require('@squad/curation-client')
const metastore = require('@squad/metastore')
jest.mock('@squad/curation-client')
jest.mock('@squad/metastore')

metastore.createDefinition.mockReturnValue('mockBondId')

test('Tests run', () => {
  expect(true).toBe(true)
})

test('newDefinitionWithBond', async () => {
  const component = {
    Component: {
      name: 'Rock',
      type_: 'Roshambo',
      data: JSON.stringify({
        winsAgainst: ['Scissors'],
        losesAgainst: ['Paper']
      })
    }
  }

  const curveAddress = '0xmockcurveaddress'
  const initialBuyUnits = 10
  const value = 55

  await squad.newDefinitionWithBond(
    component,
    curveAddress,
    initialBuyUnits,
    { value }
  )

  // should have created a metastore deffinition
  expect(metastore.createDefinition).toBeCalledWith(component)

  // should have used the returned bond id for a new curation market bond
  expect(curation.newBond).toBeCalledWith(
    curveAddress,
    'mockBondId',
    initialBuyUnits,
    { value }
  )
})
