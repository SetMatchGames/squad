import m from 'mithril'

import state from '../state.js'

const NavMenu = {
  oninit: () => {
    state.menus.nav = 'hidden'
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
      m('a', { onclick: handleLinkFactory('/formats') }, 'Play'),
      m('a', { onclick: handleLinkFactory('/new-piece') }, 'New Piece'),
      m('a', { onclick: handleLinkFactory('/new-format') }, 'New Format'),
      m('a', { onclick: handleLinkFactory('/withdraw') }, 'Withdraw')
      // TODO m('a', { onclick: handleLinkFactory('/markets') }, 'Explore Markets' )
    )
  }
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
