import m from "mithril"
import matchmaking from "../../clients/js"

let connectionStatus = 'closed'
let messages = []
const room = 'squadChess'
let peers = []
let offers = {}
let rollCallInterval
let savedMessage = 'Hello world!'

const Matchmaking = {
  view: () => {
    return m(
      'div#matchmaking',
      m(ConnectDisconnectButton),
      m(Messages),
      m(OfferList),
      m(PeerList)
    )
  }
}

import crypto from 'crypto'
const id = crypto.randomBytes(16).toString('hex')
console.log(`Our ID: ${id}`)

const ConnectDisconnectButton = {
  view: () => {
    switch (connectionStatus) {
      case 'open': {
        return m(
          `button#disconnect-button`,
          { onclick: disconnect },
          'Disconnect'
        )
      }
      case 'connecting': {
        return m(
          `div#connecting`,
          'Connecting...'
        )
      }
      default: {
        return m(
          `button#connect-button`,
          { onclick: connect },
          'Connect'
        )
      }
    }
  }
}

const Messages = {
  view: () => {
    return m(
      'p#messages',
      m('div#messagesReceived', messages),
      m(MessageForm)
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

const OfferList = {
  view: () => {
    if (connectionStatus === 'open') {
      return m(
        'p#offers',
        'Not accepting offers while a connection is live'
      )
    }
    let content = "No offers yet. Waiting..."
    if (Object.keys(offers).length) {
      content = Object.keys(offers).map(id => {
        return m(Offer, { key: id })
      })
    }
    return m(
      'p#offers',
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
    if (connectionStatus === 'open') {
      return m(
        'p#peers',
        'Not listening for peers while a connection is live'
      )
    }
    let content = 'No peers yet. Loading...'
    if (peers.length > 0) {
      content = peers.map(id => {
        return m(Peer, { key: id })
      })
    }
    return m(
      'p#peers',
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

const connect = (event) => {
  event.preventDefault()
  console.log('Connecting...')
  matchmaking.connect(id, 'ws://localhost:8889')
  matchmaking.whenServerReady(async () => {
    matchmaking.joinRoom(room)
    matchmaking.listenOffers((e) => {
      console.log('Received an offer', e)
      offers[e.from] = e.data
    })
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
    rollCallInterval = setInterval(async () => {
      await rollCall()
      m.redraw()
    }, 300)
  })
  connectionStatus = 'connecting'
}

const disconnect = (event) => {
  event.preventDefault()
  console.log('Disconnecting...')
  matchmaking.disconnect()
  matchmaking.whenServerDisconnect(() => {
    peers = []
    offers = {}
    clearInterval(rollCallInterval)
    m.redraw()
  })
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

m.mount(document.body, Matchmaking)