import IPFS from 'ipfs'

export function makeLobbyTopic(game) {
  return `squad.games/${game}/lobby`
}

export function newIPFSNode(repo) {
  return new IPFS({
    repo: repo,
    EXPERIMENTAL: {
      pubsub: true
    },
    config: {
      Addresses: {
        Swarm: [
          '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
        ]
      }
    }
  })
}
