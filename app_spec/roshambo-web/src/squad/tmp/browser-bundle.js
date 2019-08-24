'use strict'

//import domReady from 'detect-dom-ready'
import libp2p from 'libp2p'
import PeerInfo from 'peer-info'
import WebRTCStar from 'libp2p-webrtc-star'
import KadDHT from 'libp2p-kad-dht'
import CID from 'cids'

//const GossipSub = require('libp2p-gossipsub')
const WS = require('libp2p-websockets')

const BrowserBundle = require('./ipfs-browser-bundle')

class MyBundle extends libp2p {
  constructor (peerInfo) {
    const wstar = new WebRTCStar()
    const ws = new WS()
    const modules = {
      transport: [wstar, ws],
      discovery: [
        wstar.discovery,
      ],
      DHT: KadDHT,
//      pubsub: GossipSub,

      config: {
        peerDiscovery: {
          autoDial: true,
          webrtcStar: {
            interval: 1000,
            enabled: true
          }
        },
        dht: {
          kBucketSize: 20,
          enabled: true,
          randomWalk: {
            enabled: true,
            interval: 300e3,
            timeout: 10e3
          }
        }/*,
        pubsub: {
          enabled: true,
          emitSelf: true,
          signMessages: false,
          strictSigning: false
        }*/
      }
    }
    super(modules, peerInfo)
  }
}

export async function createNode (callback) {
  PeerInfo.create().then((peerInfo, err) => {

    if (err) {
      return callback(err)
    }

    const peerIdStr = peerInfo.id.toB58String()
    const ma =     '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/ipfs/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd'

    ///dns4/star-signal.cloud.ipfs.team/tcp/443/wss/p2p-webrtc-star/ipfs/${peerIdStr}`

    peerInfo.multiaddrs.add(ma)
    const node = new BrowserBundle({peerInfo})
    node.idStr = peerIdStr
    callback(null, node)

  })
}
