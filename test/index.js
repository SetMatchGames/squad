const tests = [
  require("./contribute_get.js"),
  require("./run_game.js"),
]

tests.forEach(t => {
  t.scenario.runTape(t.description, t.func)
})


