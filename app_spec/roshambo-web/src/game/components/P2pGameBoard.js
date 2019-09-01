import React from 'react'
import { connect } from 'react-redux'

import store from '../../store'

import {
  connectToLobby,
  offerGame
} from '../../squad/actions'

function mapState(state) {
  const props = {
    ...state.game,
    opponent: state.squad.opponent,
    lobby: state.squad.lobby
  }
  return props
}

function P2pGameBoard (props) {
  if (props.opponent !== {} && props.lobby !== null) {
    store.dispatch(offerGame(props.opponent, props.lobby.lobby))
  }
  return <h3>Game not started</h3>
}

export default connect(mapState)(P2pGameBoard)
