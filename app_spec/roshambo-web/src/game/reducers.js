import { combineReducers } from 'redux'
import { addActionToState } from '../utils'

import {
  GAME_STARTED,
  START_GAME_AGAINST,
  REQUEST_MOVE_ONE,
  MOVE_ONE_RECIEVED,
  REQUEST_MOVE_TWO,
  MOVE_TWO_RECIEVED,

  REVEAL_WINNER
} from './actions'

function playSession(state = null, action) {
  if ([
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

function activeGames (state = {}, action) {
  const games = {}
  if (action.type === START_GAME_AGAINST) {
    const gameId = `${action.opponent.from}${action.from}`
    games[action.from] = gameId
    games[action.opponent.from] = gameId
    return Object.assign({}, state, games)
  }
  return state
}

function startedGames (state = {}, action) {
  if (action.type === GAME_STARTED) {
    const games = {}
    const game = state[action.game.topic] ? state[action.game.topic] : {}
    games[action.game.topic] = Object.assign({}, game, action.game)
    return games
  }
  return state
}

export const game = combineReducers({
  playSession,
  activeGames,
  startedGames
})
