import { createStore, combineReducers } from 'redux'
import { squad } from 'squad'
import { lastGameLaunched } from 'runners/reducers'
import { elementLists } from 'elements/reducers'

const initialState = {
  squad: {},
  lastGameLaunched: {},
  elementLists: []
}

export const store = createStore(
  combineReducers({squad, lastGameLaunched, elementLists}),
  initialState
)
