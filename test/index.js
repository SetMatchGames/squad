// This test file uses the tape testing framework.
// To learn more, go here: https://github.com/substack/tape
const { Config, Scenario } = require("@holochain/holochain-nodejs")
Scenario.setTape(require("tape"))

const dnaPath = "./dist/bundle.json"
const agentAlice = Config.agent("alice")
const dna = Config.dna(dnaPath)
const instanceAlice = Config.instance(agentAlice, dna)
const scenario = new Scenario([instanceAlice])

scenario.runTape("Alice can contribute and get valid elements", (t, { alice }) => {
  let componentAddresses = []
  let componentModeAddresses = []

  const testCases = [
    // Games
    {
      element: {Game: {
        name: "Mock Valid Game",
        runner: `{"Mock": {"run_count": 0, "run_args": []}}`
      }},
      valid: true
    }, {
      element: {Game: {
        name: "",
        runner: `{"Mock": {"run_count": 0, "run_args": []}}`
      }},
      valid: false,
      error: "Empty game name"
    }, {
      element: {Game: {
        name: "Mock invalid runner game",
        runner: `{"Invalid": {"run_count": 0, "run_args": []}}`
      }},
      valid: false,
      error: "Invalid runner"
    }, {
      element: {Game: {
        name: "Mock empty runner game",
        runner: ""
      }},
      valid: false,
      error: "Invalid runner"
    },

    // Modes
    {
      element: {Mode: {
        name: "curlmode",
        cmd: "curl http://example.com/mode | sh"
      }},
      valid: true
    }, {
      element: {Mode: {name: "No mode", cmd: ""}},
      valid: false,
      error: "Empty mode cmd"
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
        name: "Standard+Mode",
        components: componentModeAddresses
      }},
      valid: false,
      error: "Non-component component address"
    }, {
      element: {Format: {
        name: "Standard",
        components: componentAddresses.concat(["not an address"])
      }},
      valid: false,
      error: "Component does not exist"
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

      if (getResult.Ok.Mode) {
        componentModeAddresses.push(contributeResult.Ok)
      } else if (getResult.Ok.Component) {
        componentAddresses.push(contributeResult.Ok)
        componentModeAddresses.push(contributeResult.Ok)
      }

    } else {
      t.equal(contributeResult.Ok, undefined, c.error)
      t.equal(
        JSON.parse(contributeResult.Err.Internal).kind.ValidationFailed,
        c.error
      )
    }
  })
})
