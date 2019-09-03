import findWinner from './findWinner'
import { activeGameTopic } from './utils'
import { makeLobbyTopic } from '../lobby/utils'
import { actionPublisher, subscriptionDispatcher } from '../lobby/actions'

export const START_GAME_AGAINST = "START_GAME_AGAINST"
export const GAME_STARTED = "GAME_STARTED"
export const PLAY_MOVE = "PLAY_MOVE"

export function playMove(move) {
  return { type: PLAY_MOVE, move }
}

function startGameAgainst(opponent) {
  return { type: START_GAME_AGAINST, opponent }
}

export function startGame(opponent, pubsub) {
  return (dispatch) => {
    // TODO this one is weird, figure something better out
    // it needs to be an async function but doesnt need dispatch
    const pubAction = actionPublisher(pubsub)
    const lobbyTopic = makeLobbyTopic('roshambo')
    pubAction(lobbyTopic, startGameAgainst(opponent))
  }
}

export function joinGame(activeGames, playerId, pubsub) {
  return (dispatch) => {
    const gameTopic = activeGameTopic(activeGames, playerId)
    const subDispatch = subscriptionDispatcher(dispatch, pubsub)
    console.log("joining game topic", gameTopic)
    subDispatch(gameTopic)
    dispatch(gameStarted({topic: gameTopic, playerId}))
  }
}

export function gameStarted(game) {
  return { type: GAME_STARTED, game }
}

// Registration phase
export const REQUEST_PLAYER_ONE = "REQUEST_PLAYER_ONE"
export const PLAYER_ONE_REGISTERED = "PLAYER_ONE_REGISTERED"
export const REQUEST_PLAYER_TWO = "REQUEST_PLAYER_TWO"
export const PLAYER_TWO_REGISTERED = "PLAYER_TWO_REGISTERED"

export function requestPlayerName(n /* 1 or 2 */) {
  switch(n) {
    case 1:
      return { type: REQUEST_PLAYER_ONE }
    case 2:
      return { type: REQUEST_PLAYER_TWO }
    default:
      break
  }
}

export function playerRegistered(playerName, n /* 1 or 2 */) {
  switch(n) {
    case 1:
      return { type: PLAYER_ONE_REGISTERED, player1: playerName }
    case 2:
      return { type: PLAYER_TWO_REGISTERED, player2: playerName }
    default:
      break
  }
}

// Playing phase
export const REQUEST_MOVE_ONE = "REQUEST_MOVE_ONE"
export const MOVE_ONE_RECIEVED = "MOVE_ONE_RECIEVED"
export const REQUEST_MOVE_TWO = "REQUEST_MOVE_TWO"
export const MOVE_TWO_RECIEVED = "MOVE_TWO_RECIEVED"

export function requestMove(n /* 1 or 2 */) {
  switch(n) {
    case 1:
      return { type: REQUEST_MOVE_ONE }
    case 2:
      return { type: REQUEST_MOVE_TWO }
    default:
      break
  }
}

export function moveRecieved(component, n /* 1 or 2 */) {
  switch(n) {
    case 1:
      return { type: MOVE_ONE_RECIEVED, move1: component }
    case 2:
      return { type: MOVE_TWO_RECIEVED, move2: component }
    default:
      break
  }
}

// Wrap up
export const REVEAL_WINNER = "REVEAL_WINNER"

export function revealWinner(player1, move1, player2, move2) {
  let winner = findWinner(player1, move1, player2, move2)
  return { type: REVEAL_WINNER, winner }
}
