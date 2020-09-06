import m from 'mithril'

import state from '../state.js'
import Board from '../components/Board.js'

const Play = {
  oninit: () => {
    switch (state.matchmaking.connection) {
      case 'match started':
        state.board.matchStatus = 'Match started!'
        break
      default:
        state.board.matchStatus = 'Match not started.'
    }
  },
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
      m(Board, { format: state.squad.loadedFormat })
    )
  }
}

export default Play