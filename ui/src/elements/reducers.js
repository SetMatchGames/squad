import {
  REQUEST_INDEX,
  RECEIVE_INDEX,
  INDEX_FAILURE,
} from 'elements/actions'

import { indexKey } from 'elements/utils'

function newElementIndex() {
  return {
    name: "",
    elementType: "",
    waiting: false,
    elements: [],
    status: "INITIAL"
  }
}

function elementIndex(state = newElementIndex(), action) {
  function actionInfo(action) {
    return {
      name: action.name,
      elementType: action.elementType,
      status: action.type
    }
  }

  let newState
  switch(action.type) {
  case REQUEST_INDEX:
    newState = Object.assign({}, state, actionInfo(action), {waiting: true})
    break
  case RECEIVE_INDEX:
    newState = Object.assign(
      {},
      state,
      actionInfo(action),
      {waiting: false, elements: action.elements}
    )
    break
  case INDEX_FAILURE:
    newState = Object.assign(
      {},
      state,
      actionInfo(action),
      {waiting: false, error: action.error}
    )
    break
  default:
    return state
  }
  return newState
}

export function elementIndexes(state = {}, action) {
  switch(action.type) {
  case REQUEST_INDEX:
    // initialize a new element index if one isn't there
    const key = indexKey(action.name, action.elementType)
    state[key] = state[key] ? state[key] : newElementIndex()
    break
  default:
    break
  }
  // reduce all indexes
  Object.keys(state).forEach(elementType => {
    state[elementType] = Object.assign(
      {},
      elementIndex(state[elementType], action)
    )
  })
  return Object.assign({}, state)
}
