let squad = require('../sdk/js')
let WebSocket = require('rpc-websockets').Client

// instantiate Client and connect to an RPC server
let holochainUri = 'ws://localhost:8888'
let ws = new WebSocket(holochainUri)

const runScriptURI = "https://raw.githubusercontent.com/setmatchgames/squad/app_spec/run_and_install.sh"
const roshambo = {
    "Game": {
        "name": "Roshambo",
        "type_": "linux-bash-game-v0",
        "data": JSON.stringify({
            "cmd": `curl ${runScriptURI} | sh`,
            "options": []
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
        "element": roshambo
      }
  }
  const roshamboAddress = JSON.parse(await ws.call(
    method,
    params
  ).catch(console.log)).Ok

  // try running the game
  squad.runGame(ws, instanceId, roshamboAddress, "formatAddress", agentId)
})
