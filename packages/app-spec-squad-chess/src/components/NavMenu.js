import m from 'mithril'
import { curationMarket } from '@squad/sdk'

import state from '../state.js'

let walletOrSigner

const NavMenu = {
  oninit: () => {
    state.menus.nav = 'hidden'
    walletOrSigner = curationMarket.init()
  },
  view: () => {
    return m(
      '#nav-menu.outline',
      m(MenuSymbol),
      m(MenuLinks)
    )
  }
}

const MenuSymbol = {
  view: () => {
    return m(
      'button#menu-symbol',
      { onclick: handleToggleMenu },
      m('.stripe', '—'),
      m('.stripe', '—'),
      m('.stripe', '—')
    )
  }
}

const MenuLinks = {
  view: () => {
    let display = 'none'
    if (state.menus.nav === 'visible') { display = 'flex' }
    return m(
      '#menu-links',
      { style: { display } },
      m('a', { onclick: handleLinkFactory('/variants') }, 'Play'),
      m('a', { onclick: handleLinkFactory('/new-piece') }, 'New Piece'),
      m('a', { onclick: handleLinkFactory('/new-variant') }, 'New Variant'),
      m('a', { onclick: handleLinkFactory('/withdraw') }, 'Withdraw'),
      m('a', { onclick: handleXeenus }, 'Get XEENUS tokens')
      // TODO m('a', { onclick: handleLinkFactory('/markets') }, 'Explore Markets' )
    )
  }
}

const handleXeenus = (e) => {
  e.preventDefault()
  console.log('trying to get some Xeenus!')
  // this is the Ropsten address for Xeenus
  walletOrSigner.sendTransaction({
    to: '0x7E0480Ca9fD50EB7A3855Cf53c347A1b4d6A2FF5',
    value: 0
  })
}

const handleToggleMenu = () => {
  toggleMenu()
}

const handleLinkFactory = (route) => {
  return () => {
    m.route.set(route)
    toggleMenu()
  }
}

function toggleMenu () {
  if (state.menus.nav === 'hidden') {
    state.menus.nav = 'visible'
  } else {
    state.menus.nav = 'hidden'
  }
}

export default NavMenu
