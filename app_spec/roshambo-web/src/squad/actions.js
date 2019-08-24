import { metastore } from '../sdk/js'
import { getUrlParams } from '../utils'

// TODO: move discoverGameOpponents to squad-sdk
// implementing it here now to avoid merge conflicts
//import { discoverGameOpponents } from '../sdk/js'

// Connecting to squad actions
export const STORE_SQUAD_URI = "STORE_SQUAD_URI"
export const CONNECTING_TO_SQUAD = "CONNECTING_TO_SQUAD"
export const CONNECT_TO_SQUAD_FAIL = "CONNECT_TO_SQUAD_FAIL"
export const CONNECT_TO_SQUAD_SUCCESS = "CONNECT_TO_SQUAD_SUCCESS"

export function connectToSquad(
  successCallback = () => {},
  errorCallback = () => {},
  messageCallback = () => {},
) {
  return (dispatch) => {
    let squadUri = ""
    try {
      squadUri = getUrlParams(["squadUri"])["squadUri"]
    } catch(error) {
      dispatch(connectFail(error))
      return
    }
    dispatch(storeSquadUri(squadUri))

    dispatch(connecting())
    const connection = metastore.webSocketConnection(squadUri)

    connection.on("open", () => {
      dispatch(connectSuccess(connection.on))
      successCallback(connection, dispatch)
    })
    connection.on("error", (error) => {
      dispatch(connectFail(error))
      errorCallback(error, dispatch)
    })
    connection.on("message", (message) => {
      messageCallback(message, dispatch)
    })
  }
}

export function storeSquadUri(squadUri) {
  return {type: STORE_SQUAD_URI, squadUri}
}

export function connecting() {
  return {type: CONNECTING_TO_SQUAD}
}

export function connectFail(error) {
  return {type: CONNECT_TO_SQUAD_FAIL, error}
}

export function connectSuccess(connection) {
  return {type: CONNECT_TO_SQUAD_SUCCESS, connection}
}

// Getting all formats actions
export const REQUEST_FORMAT_LIST = "REQUEST_FORMAT_LIST"
export const FORMAT_LIST_RECIEVED = "FORMAT_LIST_RECEIVED"
export const FORMAT_LIST_FAILURE = "FORMAT_LIST_FAILURE"
export const GAME_STARTED = "GAME_STARTED"
export const GAME_FINISHED = "GAME_FINISHED"

export function getFormatList() {
  return (dispatch) => {
    dispatch(requestFormatList())
    metastore.getAllDefinitionsOfType("Format").then(
      (definitions) => {
        metastore.getCatalogAddresses("Format", "Format Catalog")
          .then(
            (addresses) => {
              let list = addresses.map(address => {
                let li = {}
                li["definition"] = definitions[addresses.indexOf(address)]
                li["key"] = address
                return li
              })
              dispatch(formatListRecieved(list))
              dispatch(getFormatComponents(list[0]))
            },
            (error) => dispatch(formatListFailure(error))
          )
      },
      (error) => dispatch(formatListFailure(error))
    )
  }
}

export function requestFormatList() {
  return {type: REQUEST_FORMAT_LIST}
}

export function formatListRecieved(list) {
  return {type: FORMAT_LIST_RECIEVED, list}
}

export function formatListFailure(error) {
  return {type: FORMAT_LIST_FAILURE, error}
}

export function gameStarted() {
  return {type: GAME_STARTED}
}

export function gameFinished() {
  return {type: GAME_FINISHED}
}

// Getting components for a specific format action
export const SELECT_FORMAT = "SELECT_FORMAT"
export const FORMAT_COMPONENTS_REQUEST = "FORMAT_COMPONENTS_REQUEST"
export const FORMAT_COMPONENTS_RECIEVED = "FORMAT_COMPONENTS_RECIEVED"
export const FORMAT_COMPONENTS_FAILURE = "FORMAT_COMPONENTS_FAILURE"

export function selectFormat(selectedIndex, formats) {
  return (dispatch) => {
    let selectedFormat = formats[selectedIndex]
    dispatch({type: SELECT_FORMAT, selectedIndex})
    dispatch(getFormatComponents(selectedFormat))
  }
}

export function getFormatComponents(format) {
  return (dispatch) => {
    dispatch(requestFormatComponents(format))
    getAllComponents(format.definition.Format.components).then(
      (list) => dispatch(formatComponentsRecieved(list)),
      (error) => dispatch(formatComponentsFailure(error))
    )
  }
}

export function requestFormatComponents(format) {
  return {type: FORMAT_COMPONENTS_REQUEST, format}
}

export function formatComponentsRecieved(list) {
  return {type: FORMAT_COMPONENTS_RECIEVED, list}
}

export function formatComponentsFailure(error) {
  return {type: FORMAT_COMPONENTS_FAILURE, error }
}

async function getAllComponents(addresses) {
  let definitions = []
  for (let i in addresses) {
    let definition = {
      definition: await metastore.getDefinition(addresses[i]),
      key: addresses[i]
    }
    definitions.push(definition)
  }
  return definitions
}

// getting opponents
export const LISTEN_FOR_GAME_OPPONENTS = "LISTEN_FOR_GAME_OPPONENTS"
export const FOUND_GAME_OPPONENT = "FOUND_GAME_OPPONENT"
export const GAME_OPPONENTS_FAILURE = "GAME_OPPONENTS_FAILURE"


export const SELECT_GAME_OPPONENT = "SELECT_GAME_OPPONENT"
export const GAME_OPPONENT_CONFIRMED = "GAME_OPPONENT_CONFIRMED"
export const GAME_OPPONENT_DENIED = "GAME_OPPONENT_DENIED"
export const GAME_OPPONENT_SELECT_FAILURE = "GAME_OPPONENT_SELECT_FAILURE"

export function selectOpponent(opponent) {
  return {type: SELECT_GAME_OPPONENT, opponent}
}

export function getGameOpponents(game) {
  return (dispatch) => {
    dispatch(listenForGameOpponents(game))
    discoverGameOpponents(game, (opponent) => {
      foundGameOpponent(opponent)
    })
  }
}

export function listenForGameOpponents(game) {
  return {type: LISTEN_FOR_GAME_OPPONENTS, game}
}

export function foundGameOpponent(opponent) {
  return {type: FOUND_GAME_OPPONENT, opponent}
}

export function gameOpponentsFailure(error) {
  return {type: GAME_OPPONENTS_FAILURE, error}
}

/**
 *  discover game opponents functionality will move to squad SDK
 */

const IPFS = require('ipfs')

function gameChannelKey(game) {
  return `squad.games/${game.key}`
}

export async function discoverGameOpponents(game, cb) {
  const node = await IPFS.create({EXPERIMENTAL: {pubsub: true}})
  const chan = gameChannelKey(game)
  node.pubsub.subscribe(
    chan,
    (msg) => { console.log(`message on ${chan}:`, msg) },
    {discover: true}
  )
  node.pubsub.publish(gameChannelKey(game), Buffer.from("message", 'utf8'))
}

