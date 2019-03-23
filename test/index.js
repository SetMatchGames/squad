tests = [
  require("./contribute_get.js"),
  require("./game_runner.js")
]


tests.forEach(t => {
  t.scenario.runTape(t.description, t.func)
})


