import { newIPFSNode, makeLobbyTopic } from './utils'

export const SET_PLAYER = "SET_PLAYER"

export const CONNECT_TO_LOBBY = "CONNECT_TO_LOBBY"
export const LOBBY_FAILURE = "LOBBY_FAILURE"
export const JOIN_LOBBY = "JOIN_LOBBY"
export const LOBBY_HEARTBEAT = "LOBBY_HEARTBEAT"

export const SELECT_OPPONENT = "SELECT_OPPONENT"

export function actionPublisher(pubsub) {
  return (topic, action) => {
    pubsub.publish(topic, Buffer.from(JSON.stringify(action)))
  }
}

export function subscriptionDispatcher(
  dispatch,
  pubsub,
  predicate = (x) => { return !!x.type }
) {
  return (topic) => {
    pubsub.subscribe(topic, (msg) => {
      const action = {...JSON.parse(msg.data.toString()), ...msg}
      if (predicate(action)) {
        dispatch(action)
      }
    })
  }
}

export function connectToLobby(name, game, format) {
  return (dispatch) => {
    const node = newIPFSNode(`ipfs/${name}`)
    const lobbyTopic = makeLobbyTopic('roshambo', format)
    node.on('error', console.error)
    node.once('ready', () => node.id((err, info) => {
      if (err) { throw err }

      // TODO factor out getting and setting player name
      dispatch(setPlayer(name, info))
      dispatch(joinLobby(node))

      const pubAction = actionPublisher(node.pubsub)

      const seenHeartbeats = {}
      const subDispatch = subscriptionDispatcher(
        dispatch,
        node.pubsub,
        // dispatch filter predicate (only dispatch when this is true)
        (action) => {
          switch (action.type) {
          case LOBBY_HEARTBEAT: // only dispatch first heartbeat
            if (!seenHeartbeats[action.from]) {
              seenHeartbeats[action.from] = true
              return true
            }
            return false
          case undefined:
            return false
          default:
            return true
          }
        }
      )

      // dispatch all actions coming into the lobby channel
      subDispatch(lobbyTopic)

      // start the lobby heartbeat
      pubAction(lobbyTopic, lobbyHeartbeat(name))
      setInterval(
        () => { pubAction(lobbyTopic, lobbyHeartbeat(name)) },
        3000 // TODO make this configurable
      )
    }))
  }
}

// lobby is just an ipfs node right now, consider an interface
export function joinLobby(node) {
  return {type: JOIN_LOBBY, node}
}

export function lobbyHeartbeat(name) {
  return { type: LOBBY_HEARTBEAT, name }
}

export function setPlayer(name, info) {
  return {type: SET_PLAYER, name, info}
}

export function selectOpponent(opponent) {
  return {type: SELECT_OPPONENT, opponent}
}

