const { Config, Scenario } = require("@holochain/holochain-nodejs")
Scenario.setTape(require("tape"))

const dnaPath = "./dist/bundle.json"
const agentAlice = Config.agent("alice")
const dna = Config.dna(dnaPath)
const instanceAlice = Config.instance(agentAlice, dna)
const scenario = new Scenario([instanceAlice])

const test_func = (t, { alice }) => {
  let componentAddresses = []
  let componentGameAddresses = []

  const testCases = [
    // Games
    {
      element: {Game: {
        name: "Mock Valid Game",
        type_: "Mock",
        data: ""
      }},
      valid: true
    }, {
      element: {Game: {
        name: "",
        type_: "Mock",
        data: ""
      }},
      valid: false,
      error: "Empty game name"
    }, {
      element: {Game: {
        name: "Mock empty runner game",
        type_: "",
        data: ""
      }},
      valid: false,
      error: "Empty game type"
    },

    // Components
    {
      element: {Component: {
        name: "Rock",
        type_: "roshambo",
        data: "<Paper, >Scissors"
      }},
      valid: true
    }, {
      element: {Component: {
        name: "",
        type_: "roshambo",
        data: "<Paper, >Scissors"
      }},
      valid: false,
      error: "Empty component name"
    }, {
      element: {Component: {
        name: "Rock",
        type_: "",
        data: "<Paper, >Scissors"
      }},
      valid: false,
      error: "Empty component type"
    },

    // Formats
    {
      element: {Format: {
        name: "Standard",
        components: componentAddresses
      }},
      valid: true
    }, {
      element: {Format: {
        name: "Standard+Game",
        components: componentGameAddresses
      }},
      valid: false,
      error: "Non-component component address"
    }, {
      element: {Format: {
        name: "Standard",
        components: componentAddresses.concat(["not an address"])
      }},
      valid: false,
      error: "Invalid app entry address"
    }, {
      element: {Format: {
        name: "",
        components: componentAddresses
      }},
      valid: false,
      error: "Empty format name"
    }

  ]

  testCases.forEach(c => {
    const contributeResult = alice.call(
      "elements",
      "contribute_element",
      {element: c.element}
    )

    if (c.valid) {
      t.equal(contributeResult.Err, undefined)
      const getResult = alice.call(
        "elements",
        "get_element",
        {address: contributeResult.Ok}
      )

      t.deepEqual(getResult.Ok, c.element)

      // Gather valid and invalid component address lists
      if (getResult.Ok.Game) {
        componentGameAddresses.push(contributeResult.Ok)
      } else if (getResult.Ok.Component) {
        componentAddresses.push(contributeResult.Ok)
        componentGameAddresses.push(contributeResult.Ok)
      }

    } else {
      t.equal(contributeResult.Ok, undefined, c.error)
      t.equal(
        JSON.parse(contributeResult.Err.Internal).kind.ValidationFailed,
        c.error
      )
    }
  })
}

module.exports = {
  scenario: scenario,
  descripion: "Alice can contribute and get valid elements",
  func: test_func
}

