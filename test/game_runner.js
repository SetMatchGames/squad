const { Config, Scenario } = require("@holochain/holochain-nodejs")
let ui = require("./ui.js")

Scenario.setTape(require("tape"))

const dnaPath = "./dist/bundle.json"
const agentAlice = Config.agent("alice")
const dna = Config.dna(dnaPath)
const instanceAlice = Config.instance(agentAlice, dna)
const scenario = new Scenario([instanceAlice])

// TODO write a run game method to test
// it would take a game address, format address
// it would run the game corectly

const test_func = (t, { alice }) => {

  const gameAddressOne = alice.call(
    "elements",
    "contribute_element",
    {element: {
      Game: {
        name: "Mock Valid Game",
        type_: "Mock",
        data: "mock data"
      }
    }}
  ).Ok

  const gameAddressTwo = alice.call(
    "elements",
    "contribute_element",
    {element: {
      Game: {
        name: "Mock Valid Game",
        type_: "Mock",
        data: "different mock data"
      }
    }}
  ).Ok

  const componentAddress = alice.call(
    "elements",
    "contribute_element",
    {element: {
      Component: {
        name: "Mock component",
        type_: "mock",
        data: `{"some": "data"}`
      }
    }}
  ).Ok

  const formatAddress = alice.call(
    "elements",
    "contribute_element",
    {element: {
      Format: {
        name: "Mock Format",
        components: [componentAddress]
      }
    }}
  ).Ok

  const testCases = [
    {
      gameAddress: gameAddressOne,
      formatAddress: formatAddress,
      data: "mock data"
    }, {
      gameAddress: gameAddressTwo,
      formatAddress: formatAddress,
      data: "different mock data"
    }
  ]

  testCases.forEach(c => {
    ui.runGame(alice, c.gameAddress, c.formatAddress)
    t.deepEqual(ui.mockRunnerCalls.pop(), [c.formatAddress, c.data])
  })
}

module.exports = {
  scenario: scenario,
  descripion: "Alice can contribute and get valid elements",
  func: test_func
}
