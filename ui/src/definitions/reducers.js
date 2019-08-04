import {
  CREATE_DEFINITION_SUCCESS,
  CREATE_DEFINITION_FAILURE,
  REQUEST_CATALOG,
  RECEIVE_CATALOG,
  CATALOG_FAILURE,
  SWITCH_DEFINITION_FORM,
} from './actions'

import { catalogKey } from './utils'

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
    console.log("received catalog:", action.definitions)
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

  case CREATE_DEFINITION_SUCCESS:
    console.log("Definition created:", action.definition)
    newState = Object.assign(
      {},
      state,
      actionInfo(action)
    )
    newState.definitions.push({ definition: action.definition, key: action.key})
    break

  case CREATE_DEFINITION_FAILURE:
    console.log("Definition creation failed:", action.error)
    newState = Object.assign(
      {},
      state,
      actionInfo(action)
    )
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

export function definitionForm(state = {}, action) {
  const fields = ["name"]
  switch(action.type) {
    case SWITCH_DEFINITION_FORM:
      switch(action.definitionType) {
        case "Game":
          fields.push("type", "data")
          break
        case "Format":
          fields.push("components")
          break
        case "Component":
          fields.push("type", "data")
          break
        default:
          fields.push("type", "components", "data")
      }
      state = { type: action.definitionType, fields }
      break
    default:
      break
  }
  return Object.assign({}, state)
}
