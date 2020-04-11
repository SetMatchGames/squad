import m from 'mithril'
import { p2p } from '@squad/sdk'
import crypto from 'crypto'
import settings from './settings.json'
import state from './state.js'
import { checkWinner } from './Board.js'

export const Matchmaker = {
  oninit: () => {
    state.p2p.id = crypto.randomBytes(16).toString('hex')
    console.log(`Our matchmaking Id: ${state.p2p.id}`)

    state.p2p.room = ''
    state.p2p.peers = []
    state.p2p.offers = {}
    state.p2p.player = 0
  },
  view: () => {
    return m(
      '#matchmaker',
      m('h3', 'Matchmaking'),
      m(FindMatchForm),
      m(PeerList),
      m(OfferList),
      m(Messages)
    )
  }
}

const FindMatchForm = {
  view: () => {
    return m(
      'form#matchmaking-form',
      m(RoomField),
      m(FindMatchButton)
    )
  }
}

const RoomField = {
  view: () => {
    switch (state.p2p.connection) {
      case 'open':
        return m(
          'div#connecting',
          `Active peer connection in room "${state.p2p.room}"`
        )
      case 'connecting':
        return m(
          'div#connecting',
          `Listening in room "${state.p2p.room}"...`
        )
      default:
        return m(
          '.room',
          m('h4', 'Enter room name:'),
          m(
            'input#room-field[type=text][placeholder=Room name',
            { oninput: handleSaveRoom }
          )
        )
    }
  }
}

const FindMatchButton = {
  view: () => {
    switch (state.p2p.connection) {
      case 'open': {
        return
      }
      case 'connecting': {
        return
      }
      default: {
        return m(
          'button#connect-button',
          { onclick: handleConnect },
          'Connect'
        )
      }
    }
  }
}

const PeerList = {
  view: () => {
    if (state.p2p.connection === 'open') {
      return m(
        '#peers',
        m('h4', 'Peer List'),
        'Not listening for peers while a connection is live'
      )
    }
    let content = 'No peers yet. Loading...'
    if (state.p2p.peers.length > 0) {
      content = state.p2p.peers.map(id => {
        return m(Peer, { key: id })
      })
    }
    return m(
      '#peers',
      m('h4', 'Peer List'),
      content
    )
  }
}

const Peer = {
  view: (vnode) => {
    return m(
      '.peer',
      vnode.key,
      m('button.offer', {
        onclick: handleSendOffer,
        id: vnode.key
      }, 'Send offer')
    )
  }
}

const OfferList = {
  view: () => {
    if (state.p2p.connection === 'open') {
      return m(
        '#offers',
        m('h4', 'Offer List'),
        'Not accepting offers while a connection is live'
      )
    }
    let content = 'No offers yet. Waiting...'
    if (Object.keys(state.p2p.offers).length) {
      content = Object.keys(state.p2p.offers).map(id => {
        return m(Offer, { key: id })
      })
    }
    return m(
      '#offers',
      m('h4', 'Offer List'),
      content
    )
  }
}

const Offer = {
  view: (vnode) => {
    return m(
      '.offer',
      vnode.key,
      m('button.answer',
        {
          onclick: handleSendAnswer,
          id: vnode.key
        }, 'Accept offer')
    )
  }
}

const Messages = {
  view: () => {
    return m(
      '#messages',
      m('#messagesReceived', state.p2p.messagesReceived)
    )
  }
}

export const sendMessage = (message) => {
  console.log('Sending message:', message)
  p2p.sendMessage(message)
}

// handlers
const handleSaveRoom = (event) => {
  event.preventDefault()
  state.p2p.room = `${event.target.value}-${state.squad.loadedFormatIndex}`
}

const handleConnect = (event) => {
  event.preventDefault()
  console.log('Connecting...')

  if (!state.p2p.id) { throw new Error("Can't connect: Id not set") }
  if (!state.p2p.room) { throw new Error("Can't connect: Room not chosen") }

  p2p.connect(state.p2p.id, settings.p2pWs)
  p2p.whenServerReady(async () => {
    console.log('Peer discovery server ready.')
    p2p.joinRoom(state.p2p.room)
    p2p.listenOffers(handleReceiveOffer)
    p2p.listenConnectionStatus(handleConnectionStatus)
    p2p.listenMessage(handleReceiveMessage)
    state.p2p.rollCallInterval = setInterval(async () => {
      await rollCall()
      m.redraw()
    }, 1000)
  })
  state.p2p.connection = 'connecting'
}

const handleReceiveOffer = (event) => {
  console.log('Received an offer', event)
  state.p2p.offers[event.from] = event.data
  console.log('Current offers:', state.p2p.offers)
}

const handleConnectionStatus = (event) => {
  if (event.target) {
    state.p2p.connection = event.target.readyState
    console.log('Connection status:', state.p2p.connection)
    if (state.p2p.connection === 'open' && state.p2p.rollCallInterval) {
      m.redraw()
      clearInterval(state.p2p.rollCallInterval)
    }
  }
}

const handleReceiveMessage = (event) => {
  if (event.data) {
    console.log('Received message:', event.data)
    state.game = JSON.parse(event.data)
    checkWinner()
    m.redraw()
  }
}

const rollCall = async () => {
  state.p2p.peers = await p2p.rollCall()
  console.log(`Current peers in ${state.p2p.room} room: ${state.p2p.peers.length}`)
}

const handleSendOffer = (event) => {
  event.preventDefault()
  console.log('Sending offer event:', event)
  p2p.sendOffer(event.target.id)
}

const handleSendAnswer = (event) => {
  event.preventDefault()
  console.log('Sending answer event:', event)
  p2p.sendAnswer(event.target.id, state.p2p.offers[event.target.id])
  delete state.p2p.offers[event.target.id]

  // If we are sending the answer, we are player 2
  state.p2p.player = 1
}
