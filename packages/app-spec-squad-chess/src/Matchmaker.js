import m from 'mithril'
import { matchmaking } from '@squad/sdk'
import crypto from 'crypto'
import settings from './settings.json'
import state from './state.js'
import { checkWinner } from './Board.js'

export const Matchmaker = {
  oninit: () => {
    state.matchmaking.id = crypto.randomBytes(16).toString('hex')
    console.log(`Our matchmaking Id: ${state.matchmaking.id}`)

    state.matchmaking.room = ''
    state.matchmaking.peers = []
    state.matchmaking.offers = {}
    state.matchmaking.player = 0
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
        )
      default:
        return m(
          '.room',
          m('h4', 'Enter room name:'),
          m(
            'input#room-field[type=text][placeholder=Room name]',
            { oninput: handleSaveRoom }
          )
        )
    }
  }
}

const FindMatchButton = {
  view: () => {
    switch (state.matchmaking.connection) {
      case 'match started': { return }
      case 'offer sent': { return }
      case 'matchmaking connected': { return }
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
      m('#messagesReceived', state.matchmaking.messagesReceived)
    )
  }
}

export const sendMessage = (message) => {
  console.log('Sending message:', message)
  matchmaking.sendMessage(message)
}

// handlers
const handleSaveRoom = (event) => {
  event.preventDefault()
  state.matchmaking.room = `${event.target.value}-${state.squad.loadedFormatIndex}`
}

const handleConnect = (event) => {
  event.preventDefault()
  console.log('Connecting...')

  if (!state.matchmaking.id) { throw new Error("Can't connect: Id not set") }
  if (!state.matchmaking.room) { throw new Error("Can't connect: Room not chosen") }

  matchmaking.connect(state.matchmaking.id, settings.matchmakingWs)
  matchmaking.whenReady(() => {
    matchmaking.joinRoom(state.matchmaking.room)
    matchmaking.listenOffers(handleReceiveOffer)
    state.matchmaking.rollCallInterval = setInterval(async () => {
      await rollCall()
      m.redraw()
    }, 1000)
  })

  state.matchmaking.connection = 'matchmaking connected'
  m.redraw()
}

const handleReceiveOffer = (event) => {
  console.log('Received an offer', event)
  state.matchmaking.offers[event.from] = event.data
  console.log('Current offers:', state.matchmaking.offers)
}

const rollCall = async () => {
  state.matchmaking.peers = await matchmaking.rollCall()
  console.log(`Current peers in ${state.matchmaking.room} room: ${state.matchmaking.peers.length}`)
}

const handleSendOffer = (event) => {
  event.preventDefault()
  console.log('Sending offer event:', event.target.id)
  matchmaking.sendOffer(event.target.id, handleReceiveMessage)

  state.matchmaking.connection = 'offer sent'
  clearInterval(state.matchmaking.rollCallInterval)
  m.redraw()
}

const handleSendAnswer = (event) => {
  event.preventDefault()
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
}
