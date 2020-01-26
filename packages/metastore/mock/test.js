const WebSocket = require('rpc-websockets').Client

const ws = new WebSocket("ws://localhost:8888")

ws.on('open', () => {
  ws.call('call', {
    instance_id: 'mock_instance_id',
    zome: 'definitions',
    function: 'fake',
    args: {}
  }).then(console.log).catch(console.error)
})
