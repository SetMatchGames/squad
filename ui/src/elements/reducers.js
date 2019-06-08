import { combineReducers } from 'redux'

import store from 'store'
import { getAllAddresses } from 'squad-sdk'
import { FETCH_ELEMENT_LISTS } from 'elements/actions'

function initialElementList(title, type) {
  return {
    title,
    type,
    isFetching: false,
    elements: []
  }
}

function makeElementListReducer(type, title) {
  return (state = initialElementList(title), action) => {
    switch(action.type) {
    case FETCH_ELEMENT_LISTS:

    default:
      return state
    }
  }
}

const Game = makeElementListReducer('Game', 'Games')
const Format = makeElementListReducer('Format', 'Formats')
const Component = makeElementListReducer('Component', 'Components')

export const elementLists = combineReducers({
  Game,
  Format,
  Component
})
