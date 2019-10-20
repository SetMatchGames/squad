const squad = require('./index')

// mock the curation market and metastore
const curation = require('@squad/curation')
const metastore = require('@squad/metastore')
jest.mock('@squad/curation')
jest.mock('@squad/metastore')

metastore.createDefinition.mockReturnValue("mockBondId")

test("Tests run", () => {
  expect(true).toBe(true)
})

test("newDefinitionWithBond", async () => {
  const component = {
    Component: {
      name: "Rock",
      type_: "Roshambo",
      data: JSON.stringify({
        winsAgainst: ["Scissors"],
        losesAgainst: ["Paper"]
      })
    }
  }

  const curve_address = "0xmockcurveaddress"
  const initial_buy_units = 10
  const value = 55

  const result = await squad.newDefinitionWithBond(
    component,
    curve_address,
    initial_buy_units,
    {value}
  )

  // should have created a metastore deffinition
  expect(metastore.createDefinition).toBeCalledWith(component)

  // should have used the returned bond id for a new curation market bond
  expect(curation.newBond).toBeCalledWith(
    curve_address,
    "mockBondId",
    initial_buy_units,
    {value}
  )

})
