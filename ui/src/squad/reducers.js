import { combineReducers } from 'redux'
import {
  CONNECTING_TO_SQUAD,
  CONNECT_TO_SQUAD_FAIL,
  CONNECT_TO_SQUAD_SUCCESS,
} from 'squad/actions'

function connection(state = {}, action) {
  return (action.type === CONNECT_TO_SQUAD_SUCCESS) ? action.type : state
}

function status(state = 'INITIAL', action) {
  if ([
    CONNECTING_TO_SQUAD,
    CONNECT_TO_SQUAD_SUCCESS,
    CONNECT_TO_SQUAD_FAIL,
  ].includes(action.type)) {
    return action.type
  }
  return state
}

function error(state = null, action) {
  switch(action.type) {
  case CONNECT_TO_SQUAD_FAIL:
    return action.error
  case CONNECT_TO_SQUAD_SUCCESS:
    return null
  case CONNECTING_TO_SQUAD:
    return null
  default:
    return state
  }
}

export const squad = combineReducers({connection, status, error})
