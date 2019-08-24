import { combineReducers } from 'redux'
import { addActionToState } from '../utils'

import {
  REQUEST_PLAYER_ONE,
  PLAYER_ONE_REGISTERED,
  REQUEST_PLAYER_TWO,
  PLAYER_TWO_REGISTERED,

  REQUEST_MOVE_ONE,
  MOVE_ONE_RECIEVED,
  REQUEST_MOVE_TWO,
  MOVE_TWO_RECIEVED,

  REVEAL_WINNER
} from './actions'

function playSession(state = null, action) {
  if ([
    REQUEST_PLAYER_ONE,
    PLAYER_ONE_REGISTERED,
    REQUEST_PLAYER_TWO,
    PLAYER_TWO_REGISTERED,

    REQUEST_MOVE_ONE,
    MOVE_ONE_RECIEVED,
    REQUEST_MOVE_TWO,
    MOVE_TWO_RECIEVED,

    REVEAL_WINNER
  ].includes(action.type)) {
    return addActionToState(action, state)
  }
  return state
}

export const game = combineReducers({ playSession })