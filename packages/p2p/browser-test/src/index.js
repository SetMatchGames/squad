import m from "mithril"
import matchmaking from "../../clients/js"

const room = 'squadChess'
let peers = []
const offers = {}
let connectionStatus = null

const Matchmaking = {
  oninit: () => {
    matchmaking.init(id, 'ws://localhost:8889')
    matchmaking.whenServerReady(async () => {
      matchmaking.joinRoom(room)
      matchmaking.listenEvent('offer', (e) => {
        console.log('Received an offer', e)
        offers[e.from] = e.data
      })
      matchmaking.listenEvent('answer', (e) => {
        console.log('Received an answer', e)
        matchmaking.acceptAnswer(e.from, e.data)
      })
      matchmaking.listenEvent('candidate', (e) => {
        console.log('Received a candidate', e)
        matchmaking.addCandidate(e.from, e.data)
      })
    })
  },
  view: () => {
    return m(
      'div#matchmaking',
      { onmouseover: rollCall },
      m('div#connection-status', `Connection status: ${connectionStatus}`),
      m(OfferList),
      m(PeerList)
    )
  }
}

const OfferList = {
  view: () => {
    let content = "No offers yet. Waiting..."
    if (Object.keys(offers).length) {
      content = Object.keys(offers).map(id => {
        return m(Offer, { key: id })
      })
    }
    return m(
      'div#offers',
      content
    )
  }
}

const Offer = {
  view: (vnode) => {
    return m(
      'div.offer',
      vnode.key,
      m('button.answer',
      { 
        onclick: sendAnswer,
        id: vnode.key
      }, 'Accept offer')
    )
  }
}

const PeerList = {
  view: () => {
    let content = 'No peers yet. Loading...'
    if (peers.length > 0) {
      content = peers.map(id => {
        return m(Peer, { key: id })
      })
    }
    return m(
      'div#peers',
      content
    )
  }
}

const Peer = {
  view: (vnode) => {
    return m(
      'div.peer',
      vnode.key, 
      m('button.offer', {
        onclick: sendOffer,
        id: vnode.key
      }, 'Send offer')
    )
  }
}

const sendOffer = (event) => {
  event.preventDefault()
  console.log(event)
  matchmaking.sendOffer(event.target.id)
}

const sendAnswer = (event) => {
  event.preventDefault()
  console.log(event)
  matchmaking.sendAnswer(event.target.id, offers[event.target.id])
  delete offers[event.target.id]
}

const rollCall = async () => {
  peers = await matchmaking.rollCall()
  console.log(`Current peers in ${room} room: ${peers.length}`)
  // checkConnection()
}

const checkConnection = () => {
  const newStatus = matchmaking.connectionStatus()
  if (newStatus != connectionStatus) {
    connectionStatus = newStatus
    console.log(`Connection status changed: ${connectionStatus}`)
  }
}

import crypto from 'crypto'
const id = crypto.randomBytes(16).toString('hex')
console.log(`Our ID: ${id}`)

m.mount(document.body, Matchmaking)