import m from 'mithril'

import state from '../state.js'
import ConnectButton from  './ConnectButton.js'

const ConnectModal = {
  view: () => {
    if (state.connectModal === false) { return }
    return m(
      '#connect-modal',
      m(
        '.card',
        m('h4', "Connect to Ethereum's Ropsten testnet."),
        m('img', { src: '/img/metamask-fox.svg' }),
        m(ConnectButton)
      )
    )
  }
}

export default ConnectModal
