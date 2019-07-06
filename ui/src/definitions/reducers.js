import {
  REQUEST_CATALOG,
  RECEIVE_CATALOG,
  CATALOG_FAILURE,
} from 'definitions/actions'

import { catalogKey } from 'definitions/utils'

function newCatalog() {
  return {
    name: "",
    definitionType: "",
    waiting: false,
    definitions: [],
    status: "INITIAL"
  }
}

function catalog(state = newCatalog(), action) {
  function actionInfo(action) {
    return {
      name: action.name,
      definitionType: action.definitionType,
      status: action.type
    }
  }

  let newState
  switch(action.type) {
  case REQUEST_CATALOG:
    newState = Object.assign({}, state, actionInfo(action), {waiting: true})
    break
  case RECEIVE_CATALOG:
    newState = Object.assign(
      {},
      state,
      actionInfo(action),
      {waiting: false, definitions: action.definitions}
    )
    break
  case CATALOG_FAILURE:
    newState = Object.assign(
      {},
      state,
      actionInfo(action),
      {waiting: false, error: action.error}
    )
    console.error(action.error)
    break
  default:
    return state
  }
  return newState
}

export function catalogs(state = {}, action) {
  const key = catalogKey(action.name, action.definitionType)
  switch(action.type) {
  case REQUEST_CATALOG:
    // initialize a new definition catalog if one isn't there
    state[key] = state[key] ? state[key] : newCatalog()
    break
  default:
    break
  }
  // reduce the requested catalog
  state[key] = Object.assign(
    {},
    catalog(state[key], action)
  )
  return Object.assign({}, state)
}
