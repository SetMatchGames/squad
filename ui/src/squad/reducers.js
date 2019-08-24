import { combineReducers } from 'redux'
import { metastore } from "squad-sdk"
import {
  CONNECTING_TO_SQUAD,
  CONNECT_TO_SQUAD_FAIL,
  CONNECT_TO_SQUAD_SUCCESS,
} from './actions'

function on(state = null, action) {
  return (action.type === CONNECT_TO_SQUAD_SUCCESS) ? metastore.on : state
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

export const squad = combineReducers({on, status})
