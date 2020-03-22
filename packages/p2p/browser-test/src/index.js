import m from "mithril"
import matchmaking from "../../clients/js"

let connectionStatus = 'placeholder'
let messages = []
const room = 'squadChess'
let peers = []
const offers = {}
let rollCallInterval = null
let savedMessage = 'Hello world!'

const Matchmaking = {
  oninit: () => {
    matchmaking.init(id, 'ws://localhost:8889')
  },
  view: () => {
    return m(
      'div#matchmaking',
      m(Messages),
      m(OfferList),
      m(PeerList)
    )
  }
}

const Messages = {
  oninit: () => {
    matchmaking.listenConnectionStatus((e) => {
      if (e.target) {
        connectionStatus = e.target.readyState
        console.log(`Connection status:`, connectionStatus)
      }
    })
    matchmaking.listenMessage((e) => {
      if (e.data) {
        console.log(`Received message:`, e)
        messages.push(e.data)
      }
    })
  },
  view: () => {
    return m(
      'div#messages',
      m('div#messagesReceived', messages),
      m(MessageForm),
      m(ConnectionStatus)
    )
  }
}

const MessageForm = {
  view: () => {
    let content = [
      m(`input#message-field[type=text][placeholder=${savedMessage}]`, { oninput: saveMessage }),
      m('button#message-button[type=submit]', { onclick: sendMessage }, 'Send')
    ]
    if (connectionStatus != 'open') {
      content = 'Waiting for open connection to display message form...'
    }
    return m(
      'form#message-form',
      content
    )
  }
}

const ConnectionStatus = {
  view: () => {
    return m(
      'div#connection-status',
      `Connection status: ${connectionStatus}`
    )
  }
}

const OfferList = {
  oninit: () => {
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
  oninit: () => {
    rollCallInterval = setInterval(async () => {
      await rollCall()
      m.redraw()
    }, 300)
  },
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
  console.log('Send offer event:', event)
  matchmaking.sendOffer(event.target.id)
}

const sendAnswer = (event) => {
  event.preventDefault()
  console.log('Send answer event:', event)
  matchmaking.sendAnswer(event.target.id, offers[event.target.id])
  delete offers[event.target.id]
}

const saveMessage = (event) => {
  event.preventDefault()
  console.log('Save message event:', event)
  savedMessage = event.target.value
}

const sendMessage = (event) => {
  event.preventDefault()
  console.log('Send message event:', event)
  matchmaking.sendMessage(savedMessage)
  savedMessage = ''
  document.getElementById('message-field').value = ''
}

const rollCall = async () => {
  peers = await matchmaking.rollCall()
  console.log(`Current peers in ${room} room: ${peers.length}`)
}

import crypto from 'crypto'
const id = crypto.randomBytes(16).toString('hex')
console.log(`Our ID: ${id}`)

m.mount(document.body, Matchmaking)