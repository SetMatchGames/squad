import {
  REQUEST_INDEX,
  RECEIVE_INDEX,
  INDEX_FAILURE,
} from 'elements/actions'

function newElementIndex() {
  return {
    title: "",
    type: "",
    isGetting: false,
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

  switch(action.type) {
  case REQUEST_INDEX:
    return Object.assign({}, state, actionInfo(action), {waiting: true})
    break
  case RECEIVE_INDEX:
    return Object.assign(
      {},
      state,
      actionInfo(action),
      {waiting: false, elements: action.elements}
    )
    break
  case INDEX_FAILURE:
    return Object.assign(
      {},
      state,
      actionInfo(action),
      {waiting: false, error: action.error}
    )
    break
  default:
    return state
    break
  }
}

export function elementIndexes(state = {}, action) {
  switch(action.type) {
  case REQUEST_INDEX:
    // initialize a new element index if one isn't there
    const et = action.elementType
    state[et] = state[et] ? state[et] : newElementIndex()
  }
  // reduce all indexes
  for(const elementType in Object.keys(state)) {
    state[elementType] = Object.assign(
      {},
      elementIndex(state[elementType], action)
    )
  }
}
