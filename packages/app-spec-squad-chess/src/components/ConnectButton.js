import m from 'mithril'
import state from '../state';

import { shortHash } from '../utils.js'

const ConnectButton = {
  view: () => {
    if (ethereum.selectedAddress) {
      state.squad.account = ethereum.selectedAddress
      state.squad.connection = 'connected'
    }
    let handler
    let content
    switch (state.squad.connection) {
      case 'not connected':
        handler = connectHandler
        content = 'Connect'
        break
      case 'connected':
        content = shortHash(state.squad.account)
        break
      case 'connecting':
        content = 'Connecting..'
        break
      default:
        handler = connectHandler
        content = 'Connect'
    }
    return m(
      'button.connect',
      { onclick: handler },
      content
    )
  }
}

const connectHandler = (event) => {
  event.preventDefault()
  try {
    ethereum.request({ method: 'eth_requestAccounts' })
    .then(accounts => {
      state.squad.account = accounts[0]
      state.squad.connection = 'connected'
      console.log('Squad Connection:', state.squad.connection)
      location.reload()
    })
    state.squad.connection = 'connecting'
  } catch(e) {
    console.error('Connection error', e)
    state.squad.connection = 'not connected'
  }
}

export default ConnectButton