const { Config, Scenario } = require("@holochain/holochain-nodejs")
let squad = require("../sdk/js")

Scenario.setTape(require("tape"))

const dnaPath = "./dist/squad.dna.json"
const agentAlice = Config.agent("alice")
const dna = Config.dna(dnaPath)
const instanceAlice = Config.instance(agentAlice, dna)
const scenario = new Scenario([instanceAlice])

const mockRunnerCalls = []

const mockRunner = (format, data) => {
  mockRunnerCalls.push([format, data])
}

const testRunnerCalls = []

const testRunner = (format, data) => {
  testRunnerCalls.push([format, data])
}

squad.registerRunner("Mock", mockRunner)
squad.registerRunner("Test", testRunner)

const test_func = async (t, { alice }) => {

  const mockAddress = alice.call(
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

  const testAddress = alice.call(
    "elements",
    "contribute_element",
    {element: {
      Game: {
        name: "Test Valid Game",
        type_: "Test",
        data: "test data"
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
      gameAddress: mockAddress,
      calls: mockRunnerCalls,
      formatAddress: formatAddress,
      data: "mock data"
    }, {
      gameAddress: testAddress,
      calls: testRunnerCalls,
      formatAddress: formatAddress,
      data: "test data"
    }
  ]

  testCases.forEach(c => {
    squad.runGame(alice, c.gameAddress, c.formatAddress)
    t.deepEqual(c.calls.pop(), [c.formatAddress, c.data])
  })
}

module.exports = {
  scenario: scenario,
  descripion: "Alice can contribute and get valid elements",
  func: test_func
}
