import { activeGameTopic } from './utils'
import { makeLobbyTopic } from '../lobby/utils'
import { actionPublisher, subscriptionDispatcher } from '../lobby/actions'

export const START_GAME_AGAINST = "START_GAME_AGAINST"
export const GAME_STARTED = "GAME_STARTED"
export const PLAY_MOVE = "PLAY_MOVE"

export function playMove(gameTopic, move) {
  return { type: PLAY_MOVE, gameTopic, move }
}

function startGameAgainst(opponent) {
  return { type: START_GAME_AGAINST, opponent }
}

export function startGame(opponent, pubsub, format) {
  return (dispatch) => {
    // TODO this one is weird, figure something better out
    // it needs to be an async function but doesnt need dispatch
    const pubAction = actionPublisher(pubsub)
    const lobbyTopic = makeLobbyTopic('roshambo', format)
    console.log("lobbyTopic", lobbyTopic)
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

