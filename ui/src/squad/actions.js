export const CONNECT_TO_SQUAD = "CONNECT_TO_SQUAD"
export const CONNECTING_TO_SQUAD = "CONNECTING_TO_SQUAD"
export const CONNECT_TO_SQUAD_FAIL = "CONNECT_TO_SQUAD_FAIL"
export const CONNECT_TO_SQUAD_SUCCESS = "CONNECT_TO_SQUAD_SUCCESS"

export function connect() {
  return {type: CONNECT_TO_SQUAD}
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
