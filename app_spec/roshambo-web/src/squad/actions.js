import { metastore } from '../sdk/js'
import { getUrlParams } from '../utils'

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
      (list) => {
        dispatch(formatListRecieved(list))
        dispatch(getFormatComponents(list[0]))
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
    definitions.push(await metastore.getDefinition(addresses[i]))
  }
  return definitions
}