/* global test require expect jest */

const squad = require('./index.js')

// mock the curation market and metastore
// const curation = require('@squad/curation-client')
// const metastore = require('@squad/metastore')
jest.mock('@squad/curation-client')
jest.mock('@squad/metastore')

// metastore.createDefinition.mockReturnValue('mockBondId')

test('Tests run', () => {
  expect(true).toBe(true)
})

test('definition', async () => {
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

  const gameAddress = '0xmockgameaddress'
  const curveAddress = '0xmockcurveaddress'
  const initialBuyUnits = 10
  const value = 55

  await squad.definition(
    component,
    [gameAddress],
    initialBuyUnits,
    null,
    null,
    { value },
    curveAddress
  )

  // should have created a metastore deffinition
  // expect(metastore.createDefinition).toBeCalledWith(component, [gameAddress])

  // should have used the returned bond id for a new curation market bond
  /*
  expect(curation.newBond).toBeCalledWith(
    'mockBondId',
    initialBuyUnits,
    null,
    null,
    { value },
    curveAddress
  )
  */
})
