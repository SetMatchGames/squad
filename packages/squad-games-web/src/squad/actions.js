import { metastore } from "@squad/sdk"

export const CONNECTING_TO_SQUAD = "CONNECTING_TO_SQUAD"
export const CONNECT_TO_SQUAD_FAIL = "CONNECT_TO_SQUAD_FAIL"
export const CONNECT_TO_SQUAD_SUCCESS = "CONNECT_TO_SQUAD_SUCCESS"

export function connectToSquad(
  uri,
  successCallback = () => {},
  errorCallback = () => {},
  messageCallback = () => {},
) {
  return dispatch => {
    dispatch(connecting())
    const connection = metastore.webSocketConnection(uri)
    console.log(connection)
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

export function connecting() {
  return {type: CONNECTING_TO_SQUAD}
}

export function connectFail(error) {
  return {type: CONNECT_TO_SQUAD_FAIL, error}
}

export function connectSuccess(connection) {
  return {type: CONNECT_TO_SQUAD_SUCCESS, connection}
}
