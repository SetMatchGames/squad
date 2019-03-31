const { Config, Scenario } = require("@holochain/holochain-nodejs")
Scenario.setTape(require("tape"))

const dnaPath = "./dist/squad.dna.json"
const agentAlice = Config.agent("alice")
const dna = Config.dna(dnaPath)
const instanceAlice = Config.instance(agentAlice, dna)
const scenario = new Scenario([instanceAlice], {debugLog: true})

const test_func = (t, { alice }) => {
  let componentAddresses = []
  let componentGameAddresses = []

  const testCases = [
    // Games
    {
      Game: {
        name: "Mock Valid Game",
        type_: "Mock",
        data: ""
      },
      valid: true
    }, {
      Game: {
        name: "",
        type_: "Mock",
        data: ""
      },
      valid: false,
      error: "Empty game name"
    }, {
      Game: {
        name: "Mock empty runner game",
        type_: "",
        data: ""
      },
      valid: false,
      error: "Empty game type"
    },

    // Components
    {
      Component: {
        name: "Rock",
        type_: "roshambo",
        data: "<Paper, >Scissors"
      },
      valid: true
    }, {
      Component: {
        name: "",
        type_: "roshambo",
        data: "<Paper, >Scissors"
      },
      valid: false,
      error: "Empty component name"
    }, {
      Component: {
        name: "Rock",
        type_: "",
        data: "<Paper, >Scissors"
      },
      valid: false,
      error: "Empty component type"
    },

    // Formats
    {
      Format: {
        name: "Standard",
        components: componentAddresses
      },
      valid: true
    }, {
      Format: {
        name: "Standard+Game",
        components: componentGameAddresses
      },
      valid: false,
      error: "Non-component component address"
    }, {
      Format: {
        name: "Standard",
        components: componentAddresses.concat(["not an address"])
      },
      valid: false,
      error: "Invalid app entry address"
    }, {
      Format: {
        name: "",
        components: componentAddresses
      },
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
    console.log(contributeResult)

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

