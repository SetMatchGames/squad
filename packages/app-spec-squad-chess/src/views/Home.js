import m from 'mithril'

const Home = {
  view: () => {
    return m(
      '#home.body',
      m(Blurb),
      m(PlayButton),
      m(CreationButtons),
    )
  }
}

const Blurb = {
  view: () => {
    return m(
      '.blurb',
      'Play and create new variations of chess.'
    )
  }
}

const PlayButton = {
  view: () => {
    return m(
      'button',
      { onclick: () => { m.route.set('/formats') } },
      'Play'
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
        'New Chess Piece'
      ),
      m(
        'button',
        { onclick: () => { m.route.set('/new-format') } },
        'New Chess Format'
      )
    )
  }
}

export default Home