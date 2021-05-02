import m from 'mithril'

import Home from './views/Home.js'
import VariantStore from './views/VariantStore.js'
import Matchmaking from './views/Matchmaking.js'
import Play from './views/Play.js'
import NewVariant from './views/NewVariant.js'
import NewPiece from './views/NewPiece.js'
import Withdraw from './views/Withdraw.js'

import NavMenu from './components/NavMenu.js'
import ConnectButton from './components/ConnectButton.js'
import ConnectModal from './components/ConnectModal.js'
import AlertList from './components/AlertList.js'

import state from './state.js'

const LandingPage = {
  view: () => {
    return m(
      '#app.landing',
      m(Title),
      m(Home)
    )
  }
}

const Header = {
  view: () => {
    return m(
      '#header',
      m(Title),
      m(NavMenu),
      m(ConnectButton)
    )
  }
}

const Title = {
  view: () => {
    return m(
      'h1',
      m(
        'a',
        { href: '/' },
        '🦑 Squad Chess'
      )
    )
  }
}

const Footer = {
  view: () => {
    return m(
      '#footer',
      m(Citation)
    )
  }
}

const Citation = {
  view: () => {
    return m(
      '.citation',
      'Non-standard chess icons made by ',
      m('a', { href: 'https://www.flaticon.com/authors/freepik' }, 'Freepik'),
      ' from ',
      m('a', { href: 'https://www.flaticon.com/' }, 'www.flaticon.com'),
      '.'
    )
  }
}

function layout (body) {
  return {
    render: (vnode) => {
      let onclick
      let visibleMenu = false
      Object.keys(state.menus).forEach(menu => {
        if (state.menus[menu] === 'visible') { visibleMenu = true }
      })
      if (visibleMenu) { onclick = hideMenus }
      return m(
        '#app',
        { onclick },
        m(ConnectModal),
        m(AlertList),
        m(Header),
        m(body, vnode.attrs),
        m(Footer)
      )
    }
  }
}

const hideMenus = () => {
  Object.keys(state.menus).forEach(menu => {
    if (state.menus[menu] === 'visible') {
      state.menus[menu] = 'hidden'
    }
  })
}

m.route(document.body, '/', {
  '/': { render: () => { return m(LandingPage) } },
  '/variants': layout(VariantStore),
  '/matchmaking/:variantAddress': layout(Matchmaking),
  '/play': layout(Play),
  '/new-piece': layout(NewPiece),
  '/new-variant': layout(NewVariant),
  '/withdraw': layout(Withdraw)
})
