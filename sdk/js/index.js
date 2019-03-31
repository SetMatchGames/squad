const runners = {}

const registerRunner = (type_, runner) => {
  runners[type_] = runner
}

const runGame = (agent, gameAddress, formatAddress) => {
  const result = agent.call("elements", "get_element", {address: gameAddress})
  // TODO add a test case for when there is an error, like incorrect address
  if (result.Ok === undefined) {
    console.log(result)
    throw result
  }
  const runner = runners[result.Ok.Game.type_]
  runner(formatAddress, result.Ok.Game.data)
}

module.exports = {
  runGame,
  registerRunner
}
