import { createStore, combineReducers, applyMiddleware } from 'redux'
import { thunk } from 'redux-thunk'
import { squad } from 'squad/reducersc'
import { elementIndexes } from 'elements/reducer'

const rootReducer = combineReducers({squad, elementIndexes})
const initialState = rootReducer(undefined, {type: undefined})
export const store = createStore(
  rootReducer,
  initialState,
  applyMiddleware(thunk)
)

