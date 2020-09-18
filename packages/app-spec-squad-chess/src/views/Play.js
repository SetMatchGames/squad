import m from 'mithril'

import state from '../state.js'
import Board from '../components/Board.js'

const Play = {
  view: () => {
    // Redirect if no format is included
    if (!state.squad.loadedFormat) {
      m.route.set('/formats')
      // TODO Notification asking them to load a format
      console.log('Format required to play a match. Current format:', state.squad.loadedFormat)
      return
    }
    return m(
      '#play.body',
      m('p#match-status', `${state.board.matchStatus}`),
      m(Board, { 
        format: state.squad.loadedFormat,
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
      { onclick: () => { m.route.set(`/matchmaking/${state.squad.loadedFormat.address}`) } },
      'Play Again'
    )
  }
}

export default Play