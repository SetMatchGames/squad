import m from 'mithril'

const NavMenu = {
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
      { onclick: handleToggleLinks },
      m('.stripe', '—'),
      m('.stripe', '—'),
      m('.stripe', '—')
    )
  }
}

const MenuLinks = {
  view: () => {
    return m(
      '#menu-links',
      { style: { display: 'none' } },
      m('a', { onclick: handleLinkFactory('/formats') }, 'Play'),
      m('a', { onclick: handleLinkFactory('/new-piece') }, 'New Piece' ),
      m('a', { onclick: handleLinkFactory('/new-format') }, 'New Format'),
      // m('a', { onclick: handleLinkFactory('/markets') }, 'Explore Markets' )
    )
  }
}

const handleToggleLinks = () => {
  toggleLinks()
}

const handleLinkFactory = (route) => {
  return () => {
    m.route.set(route)
    toggleLinks()
  }
}

function toggleLinks() {
  const links = document.getElementById('menu-links')
  if (links.style.display === 'none') {
    links.style.display = 'flex'
  } else {
    links.style.display = 'none'
  }
}

export default NavMenu