const { Config, Scenario } = require("@holochain/holochain-nodejs")
let squad = require("../sdk/js")

Scenario.setTape(require("tape"))

const dnaPath = "./dist/squad.dna.json"
const agentAlice = Config.agent("alice")
const dna = Config.dna(dnaPath)
const instanceAlice = Config.instance(agentAlice, dna)
const scenario = new Scenario([instanceAlice])

const test_func = async (t, { alice }) => {

}

module.exports = {
  scenario: scenario,
  descripion: "Alice can run roshambo as a linux bash game",
  func: test_func
}
