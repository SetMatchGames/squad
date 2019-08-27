import { combineReducers } from 'redux'
import { addActionToState } from '../utils'

import {
  STORE_SQUAD_URI,
  CONNECTING_TO_SQUAD,
  CONNECT_TO_SQUAD_FAIL,
  CONNECT_TO_SQUAD_SUCCESS,

  REQUEST_FORMAT_LIST,
  FORMAT_LIST_RECIEVED,
  FORMAT_LIST_FAILURE,

  SET_PLAYER,
  LISTEN_FOR_OPPONENTS,
  FOUND_OPPONENT,
  OPPONENTS_FAILURE,
  SELECT_OPPONENT,
  OPPONENT_CONFIRMED,
  OPPONENT_SELECT_FAILURE,
  JOIN_LOBBY,

  SELECT_FORMAT,
  FORMAT_COMPONENTS_REQUEST,
  FORMAT_COMPONENTS_RECIEVED,
  FORMAT_COMPONENTS_FAILURE,
  GAME_STARTED,
  GAME_FINISHED
} from './actions'

function uri(state = null, action) {
    return (action.type === STORE_SQUAD_URI) ? action.squadUri : state
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

function formats(state = null, action) {
  if ([
    REQUEST_FORMAT_LIST,
    FORMAT_LIST_RECIEVED,
    FORMAT_LIST_FAILURE,
    GAME_STARTED,
    GAME_FINISHED
  ].includes(action.type)) {
    return addActionToState(action, state)
  }
  return state
}

function components(state = null, action) {
  if ([
    SELECT_FORMAT,
    FORMAT_COMPONENTS_REQUEST,
    FORMAT_COMPONENTS_RECIEVED,
    FORMAT_COMPONENTS_FAILURE
  ].includes(action.type)) {
    return addActionToState(action, state)
  }
  return state
}

function opponentStatus(state = null, action) {
  if ([
    LISTEN_FOR_OPPONENTS,
    OPPONENTS_FAILURE,
    OPPONENT_CONFIRMED,
    OPPONENT_SELECT_FAILURE,
  ].includes(action.type)) {
    return addActionToState(action, state)
  }
  return state
}

function opponent(state = {}, action) {
  if (action.type === SELECT_OPPONENT) {
    state = Object.assign({}, action.opponent)
  }
  return state
}

function opponents(state = {}, action) {
  if (action.type === FOUND_OPPONENT) {
    const opponentById = {}
    opponentById[action.opponent.id] = action.opponent
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

function lobby(state = null, action) {
  if (action.type === JOIN_LOBBY) {
    return Object.assign({}, action)
  }
  return state
}

export const squad = combineReducers({
  uri,
  status,
  formats,
  components,
  player,
  opponentStatus,
  opponents,
  opponent,
  lobby
})
