const { Config, Scenario } = require("@holochain/holochain-nodejs")
let squad = require("../sdk/js")

Scenario.setTape(require("tape"))

const dnaPath = "./dist/squad.dna.json"
const agentAlice = Config.agent("alice")
const dna = Config.dna(dnaPath)
const instanceAlice = Config.instance(agentAlice, dna)
const scenario = new Scenario([instanceAlice])

const mockRunnerCalls = []

const baseMockRunner = (agent, formatAddress, data, calls) => {
  // register the call
  calls.push([agent, formatAddress, data])

  // show that this game can get the components from the  format
  const format = agent.call(
    "elements",
    "get_element",
    {address: formatAddress}
  ).Ok.Format
  const components = format.components.map(c => {
    return agent.call("elements", "get_element", {address: c}).Ok
  })
  return {
    formatName: format.name,
    agentAddress: agent.agentId,
    components: components
  }
}

const mockRunner = (agent, format, data) => {
  return baseMockRunner(agent, format, data, mockRunnerCalls)
}

const testRunnerCalls = []

const testRunner = (agent, format, data) => {
  return baseMockRunner(agent, format, data, testRunnerCalls)
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
        data: "mock game data"
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

  const component = {
      Component: {
        name: "Mock component",
        type_: "mock",
        data: `{"some": "data"}`
      }
  }
  const componentAddress = alice.call(
    "elements",
    "contribute_element",
    {element: component}
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
      gameData: "mock game data"
    }, {
      gameAddress: testAddress,
      calls: testRunnerCalls,
      formatAddress: formatAddress,
      gameData: "test data"
    }
  ]

  testCases.forEach(c => {
    const {
      formatName,
      agentAddress,
      components
    } = squad.runGame(alice, c.gameAddress, c.formatAddress)

    // confirm that the right runner was called with the right stuff
    t.deepEqual(c.calls.pop(), [alice, c.formatAddress, c.gameData])

    // confirm that the game was able to get the format and agent
    // NOTE we used the same format for both runs so check for that every time
    t.equal(formatName, "Mock Format")
    t.equal(agentAddress, alice.agentId)
    t.deepEqual(components, [component])
  })
}

module.exports = {
  scenario: scenario,
  descripion: "Alice can contribute and get valid elements",
  func: test_func
}
