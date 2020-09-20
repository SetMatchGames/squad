import m from 'mithril'

const Home = {
  view: () => {
    return m(
      '#home.body',
      m(Blurb),
      m(Buttons)
    )
  }
}

const Blurb = {
  view: () => {
    return m(
      '.blurb',
      'Play and create new variations of chess. Get paid for your creations.'
    )
  }
}

const Buttons = {
  view: () => {
    return m(
      '.buttons',
      m(PlayButton),
      m(CreationButtons)
    )
  }
}

const PlayButton = {
  view: () => {
    return m(
      'button#play',
      { onclick: () => { m.route.set('/formats') } },
      m('h2', 'Play')
    )
  }
}

const CreationButtons = {
  view: () => {
    return m(
      '.creation-buttons',
      m(
        'button',
        { onclick: () => { m.route.set('/new-piece') } },
        m('h4', 'New Chess Piece')
      ),
      m(
        'button',
        { onclick: () => { m.route.set('/new-format') } },
        m('h4', 'New Chess Format')
      )
    )
  }
}

export default Home
