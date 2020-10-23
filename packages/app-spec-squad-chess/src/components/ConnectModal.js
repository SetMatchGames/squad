import m from 'mithril'

import state from '../state.js'

const ConnectModal = {
  view: () => {
    if (state.connectModal === false) { return }
    return m(
      '#connect-modal',
      m(
        '.card',
        m('h4', "Connect to Ethereum's Ropsten testnet and reload."),
        m(
          'a',
          { href: '/' },
          m('img', { src: '/img/metamask-fox.svg' })
        )
      )
    )
  }
}

export default ConnectModal
