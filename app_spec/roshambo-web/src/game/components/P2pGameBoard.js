import React from 'react'
import { connect } from 'react-redux'

import store from '../../store'

import {
  connectToLobby,
  offerGame
} from '../../squad/actions'

function mapState(state) {
  return state.game
}

function P2pGameBoard (props) {
  return <h3>Game not started</h3>
}

export default connect(mapState)(P2pGameBoard)
