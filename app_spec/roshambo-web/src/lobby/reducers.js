import { combineReducers } from 'redux'

import {
  LOBBY_HEARTBEAT,
  OPPONENTS_FAILURE,
  OPPONENT_CONFIRMED,
  OPPONENT_SELECT_FAILURE,
  SELECT_OPPONENT,
  SET_PLAYER,
  JOIN_LOBBY
} from './actions'

function opponentStatus(state = {}, action) {
  if ([
    OPPONENTS_FAILURE,
    OPPONENT_CONFIRMED,
    OPPONENT_SELECT_FAILURE,
  ].includes(action.type)) {
    return { ...action }
  }
  return state
}

function opponentSelections(state = {}, action) {
  if (action.type === SELECT_OPPONENT) {
    const newState = Object.assign({}, state)
    newState[action.from] = action.opponent
    return newState
  }
  return state
}

function opponents(state = {}, action) {
  if (action.type === LOBBY_HEARTBEAT &&
      state[action.from] === undefined) {
    const opponentById = {}
    opponentById[action.from] = action
    return Object.assign({}, state, opponentById)
  }
  return state
}

function player(state = {}, action) {
  if (action.type === SET_PLAYER) {
    return Object.assign({}, action)
  }
  return state
}

function node(state = null, action) {
  if (action.type === JOIN_LOBBY) {
    return { ...action.node }
  }
  return state
}

export const lobby = combineReducers({
  player,
  opponentStatus,
  opponents,
  opponentSelections,
  node
})
