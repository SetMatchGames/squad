import m from 'mithril'

import state from '../state.js'
import Board from '../components/Board.js'

const Play = {
  view: () => {
    // Redirect if no variant is included
    if (!state.squad.loadedVariant) {
      m.route.set('/variants')
      // TODO Notification asking them to load a variant
      console.log('Variant required to play a match. Current variant:', state.squad.loadedVariant)
      return
    }

    return m(
      '#play.body',
      m('p#match-status.italics', state.board.matchStatus),
      m(Board, {
        variant: state.squad.loadedVariant,
        matchStatus: state.matchmaking.connection
      }),
      m(PlayAgainButton)
    )
  }
}

const PlayAgainButton = {
  view: () => {
    return m(
      'button',
      { onclick: () => { m.route.set(`/matchmaking/${state.squad.loadedVariant.address}`) } },
      'Play Again'
    )
  }
}

export default Play
