import m from 'mithril'

const ConnectModal = {
  view: () => {
    return m(
      '#connect-modal',
      m(
        '.card',
        m('h4', "Connect MetaMask to Ethereum's Ropsten testnet."),
        m(
          'a',
          { href: 'https://metamask.io'},
          m('img', { src: '/img/metamask-fox.svg' })
        )
      )
    )
  }
}

export default ConnectModal