import m from 'mithril'
<<<<<<< HEAD
import { matchmaking } from '@squad/sdk'
=======
import { p2p } from '@squad/sdk'
>>>>>>> develop
import crypto from 'crypto'
import settings from './settings.json'
import state from './state.js'
import { checkWinner } from './Board.js'

export const Matchmaker = {
  oninit: () => {
<<<<<<< HEAD
    state.matchmaking.id = crypto.randomBytes(16).toString('hex')
    console.log(`Our matchmaking Id: ${state.matchmaking.id}`)

    state.matchmaking.room = ''
    state.matchmaking.peers = []
    state.matchmaking.offers = {}
    state.matchmaking.player = 0
=======
    state.p2p.id = crypto.randomBytes(16).toString('hex')
    console.log(`Our matchmaking Id: ${state.p2p.id}`)

    state.p2p.room = ''
    state.p2p.peers = []
    state.p2p.offers = {}
    state.p2p.player = 0
>>>>>>> develop
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
<<<<<<< HEAD
    switch (state.matchmaking.connection) {
      case 'match started':
        return m(
          'div#connection',
          `Active peer connection in room "${state.matchmaking.room}"`
        )
      case 'offer sent':
        return m(
          'div#connection',
          'Offer sent'
        )
      case 'matchmaking connected':
        return m(
          'div#connection',
          `Listening in room "${state.matchmaking.room}"...`
=======
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
>>>>>>> develop
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
<<<<<<< HEAD
    switch (state.matchmaking.connection) {
      case 'match started': { return }
      case 'offer sent': { return }
      case 'matchmaking connected': { return }
=======
    switch (state.p2p.connection) {
      case 'open': {
        return
      }
      case 'connecting': {
        return
      }
>>>>>>> develop
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
<<<<<<< HEAD
    switch (state.matchmaking.connection) {
      case 'match started': {
        return m(
          '#peers',
          m('h4', 'Peer List'),
          'Not listening for peers while a connection is live'
        )
      }
      case 'offer sent': {
        return m(
          '#peers',
          m('h4', 'Peer List'),
          'Not listening for peers while your offer is pending'
        )
      }
      case 'matchmaking connected': {
        let content = 'No peers yet. Loading...'
        if (state.matchmaking.peers.length > 0) {
          content = state.matchmaking.peers.map(id => {
            return m(Peer, { key: id })
          })
        }
        return m(
          '#peers',
          m('h4', 'Peer List'),
          content
        )
      }
      default: {

      }
    }
=======
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
>>>>>>> develop
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
<<<<<<< HEAD
    switch (state.matchmaking.connection) {
      case 'match started': {
        return m(
          '#offers',
          m('h4', 'Offer List'),
          'Not accepting offers while a connection is live'
        )
      }
      case 'offer sent': {
        return m(
          '#peers',
          m('h4', 'Peer List'),
          'Not accepting offers while your offer is pending'
        )
      }
      case 'matchmaking connected': {
        let content = 'No offers yet. Waiting...'
        if (Object.keys(state.matchmaking.offers).length) {
          content = Object.keys(state.matchmaking.offers).map(id => {
            return m(Offer, { key: id })
          })
        }
        return m(
          '#offers',
          m('h4', 'Offer List'),
          content
        )
      }
      default: {

      }
    }
=======
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
>>>>>>> develop
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
<<<<<<< HEAD
      m('#messagesReceived', state.matchmaking.messagesReceived)
=======
      m('#messagesReceived', state.p2p.messagesReceived)
>>>>>>> develop
    )
  }
}

export const sendMessage = (message) => {
  console.log('Sending message:', message)
<<<<<<< HEAD
  matchmaking.sendMessage(message)
=======
  p2p.sendMessage(message)
>>>>>>> develop
}

// handlers
const handleSaveRoom = (event) => {
  event.preventDefault()
<<<<<<< HEAD
  state.matchmaking.room = `${event.target.value}-${state.squad.loadedFormatIndex}`
=======
  state.p2p.room = `${event.target.value}-${state.squad.loadedFormatIndex}`
>>>>>>> develop
}

const handleConnect = (event) => {
  event.preventDefault()
  console.log('Connecting...')

<<<<<<< HEAD
  if (!state.matchmaking.id) { throw new Error("Can't connect: Id not set") }
  if (!state.matchmaking.room) { throw new Error("Can't connect: Room not chosen") }

  matchmaking.connect(state.matchmaking.id, settings.matchmakingWs)
  matchmaking.whenReady(() => {
    matchmaking.joinRoom(state.matchmaking.room)
    matchmaking.listenOffers(handleReceiveOffer)
    state.matchmaking.rollCallInterval = setInterval(async () => {
=======
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
>>>>>>> develop
      await rollCall()
      m.redraw()
    }, 1000)
  })
<<<<<<< HEAD

  state.matchmaking.connection = 'matchmaking connected'
  m.redraw()
=======
  state.p2p.connection = 'connecting'
>>>>>>> develop
}

const handleReceiveOffer = (event) => {
  console.log('Received an offer', event)
<<<<<<< HEAD
  state.matchmaking.offers[event.from] = event.data
  console.log('Current offers:', state.matchmaking.offers)
}

const rollCall = async () => {
  state.matchmaking.peers = await matchmaking.rollCall()
  console.log(`Current peers in ${state.matchmaking.room} room: ${state.matchmaking.peers.length}`)
=======
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
>>>>>>> develop
}

const handleSendOffer = (event) => {
  event.preventDefault()
<<<<<<< HEAD
  console.log('Sending offer event:', event.target.id)
  matchmaking.sendOffer(event.target.id, handleReceiveMessage)

  state.matchmaking.connection = 'offer sent'
  clearInterval(state.matchmaking.rollCallInterval)
  m.redraw()
=======
  console.log('Sending offer event:', event)
  p2p.sendOffer(event.target.id)
>>>>>>> develop
}

const handleSendAnswer = (event) => {
  event.preventDefault()
<<<<<<< HEAD
  console.log('Sending answer event:', event.target.id)
  matchmaking.sendAnswer(event.target.id, handleReceiveMessage)
  delete state.matchmaking.offers[event.target.id]
  // If we are sending the answer, we are player 2
  state.matchmaking.player = 1

  state.matchmaking.connection = 'match started'
  clearInterval(state.matchmaking.rollCallInterval)
  m.redraw()
}

const handleReceiveMessage = (event) => {
  if (event.from !== state.matchmaking.id) {
    console.log('Received message:', event)
    if (event.data === 'match started') {
      state.matchmaking.connection = event.data
    } else {
      state.game = event.data
      checkWinner()
    }
    m.redraw()
  }
=======
  console.log('Sending answer event:', event)
  p2p.sendAnswer(event.target.id, state.p2p.offers[event.target.id])
  delete state.p2p.offers[event.target.id]

  // If we are sending the answer, we are player 2
  state.p2p.player = 1
>>>>>>> develop
}
