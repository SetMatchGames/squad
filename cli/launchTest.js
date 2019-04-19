let squad = require('../sdk/js')
let WebSocket = require('rpc-websockets').Client

// instantiate Client and connect to an RPC server
let holochainUri = 'ws://localhost:8888'
let ws = new WebSocket(holochainUri)
const roshambo = {
    "Game": {
        "name": "Roshambo",
        "type_": "linux-bash-game-v0",
        "data": JSON.stringify({
            "cmd": "git",
            "options": [
                "clone",
                "https://github.com/SetMatchGames/smg-proof-of-concept.git"
            ],
            "folder": "smg-proof-of-concept"
        })
    }
}

ws.on('open', async () => {
  // get basic instance information
  let method = 'info/instances'
  let info = await ws.call(method, {})
  const instanceId = info[0].id
  const agentId = info[0].agent

  // add a game element
  method = 'call'
  let params = {
      "instance_id": instanceId,
      "zome": "elements",
      "function": "contribute_element",
      "params": {
        "element": roshambo,
      }
  }
  const roshamboAddress = JSON.parse(await ws.call(method, params).catch(console.log)).Ok

  // try running the game
  squad.runGame(ws, instanceId, roshamboAddress, "formatAddress", agentId)
})