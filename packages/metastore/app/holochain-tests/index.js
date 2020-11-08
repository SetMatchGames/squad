const tests = [
  require('./test_linux_bash_game_runner.js'),
  require('./contribute_get.js'),
  require('./run_game.js')
]

tests.forEach(t => {
  t.scenario.runTape(t.description, t.func)
})
