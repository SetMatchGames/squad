const runners = {
  "linux-bash-game-v0": (agent, formatAddress, gameData) => {
    // presume we are running a node linux bash squad client
    // start a process identified in the game data
    
  },
  "web-game-v0": (agent, formatAddress, gameData) => {
    if (!window) {
      console.log("web-game-v0 needs to launch from web squad")
      return
    }
    // web-game-v0 requires a url for where the game is
    // TODO how do we document (or self document) the game data
    // requirements for the different game types
    // Consider adding macros for formatAddress, agent.id, agent addr
    // etc. This would allow us to create a large number of options
    // for passing context to the web game
    let gameURL = new URL(gameData.__webGameV0.gameURL)
    gameURL.searchParams.append("squad-web-game-v0-format", formatAddress)
    gameURL.searchParams.append("squad-web-game-v0-agent-nick", agent.id)
    gameURL.searchParams.append(
      "squad-web-game-v0-agent-addr",
      agent.agentId,
    )
    window.open(gameURL, "_blank")
  }
}

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

  // Runners unpack the format and present it to the game in a consistent way
  // should this be done with the game data as well? what if the game data is
  // very large?
  // - no, game contributors have the ability to factor address game
  // data however they want but they don't have that ability with formats
  return runner(agent, formatAddress, result.Ok.Game.data)
}

module.exports = {
  runGame,
  registerRunner
}
