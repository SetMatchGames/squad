import { combineReducers } from 'redux'
import {
  connect,
  CONNECT_TO_SQUAD,
  connecting,
  CONNECTING_TO_SQUAD,
  connectFail,
  CONNECT_TO_SQUAD_FAIL,
  connectSuccess,
  CONNECT_TO_SQUAD_SUCCESS,
} from 'squad'

import { webSocketConnection } from 'squad-sdk'

function connection(state = {}, action) {
  if (action.type === CONNECT_TO_SQUAD_SUCCESS) {
    return action.connection
  }
  return state
}

function status(state = 'INITIAL', action) {
  switch(action.type) {
  case CONNECT_TO_SQUAD:
    return async dispatch => {
      dispatch(connecting())
      webSocketConnection("ws://localhost:8888").then(
        connection => dispatch(connectSuccess(connection)),
        error => dispatch(connectFail(e))
      )
    }
  case CONNECTING_TO_SQUAD:
    return "CONNECTING"
  case CONNECT_TO_SQUAD_SUCCESS:
    return "CONNECTED"
  case CONNECT_TO_SQUAD_FAIL:
    return "FAILED"
  default:
    return state
  }
}

function error(state = null, action) {
  switch(action.type) {
  case CONNECT_TO_SQUAD_FAIL:
    return action.error
  case CONNECT_TO_SQUAD:
    return null
  case CONNECT_TO_SQUAD_SUCCESS:
    return null
  default:
    return state
  }
}

export const squad = combineReducers({connection, status, error})
