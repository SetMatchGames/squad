/* global localStorage */

import m from 'mithril'

import Home from './views/Home.js'
import FormatStore from './views/FormatStore.js'
import Matchmaking from './views/Matchmaking.js'
import Board from './views/Board.js'
import NewFormat from './views/NewFormat.js'
import NewPiece from './views/NewPiece.js'

import NavMenu from './components/NavMenu.js'

const LandingPage = {
  view: () => {
    return m(
      '#app',
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
      m(NavMenu)
    )
  }
}

const Title = {
  view: () => {
    return m('h1', '🦑 Squad Chess')
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

function layout(body) {
  return {
    render: (vnode) => {
      return m(
        '#app',
        m(Header),
        m(body, vnode.attrs),
        m(Footer)
      )
    }
  }
}

m.route(document.body, "/", {
  "/": { render: () => { return m(LandingPage) } },
  "/formats": layout(FormatStore),
  "/matchmaking/:formatAddress": layout(Matchmaking),
  "/play": layout(Board),
  "/new-piece": layout(NewPiece),
  "/new-format": layout(NewFormat)
})