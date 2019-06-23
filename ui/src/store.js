import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { squad } from 'squad/reducers'
import { elementIndexes } from 'elements/reducers'

/**
state = {
  squad: {...},
  elementIndexes: {
    Games-Game: {
      title: String,
      elements: {
        elementAddress: { ...element }
      }
    }
    Formats-Format: {
      title: String,
      element: {...}
    }
  }
  ...
}

*/

const composeEnhansers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(
  combineReducers({squad, elementIndexes}),
  composeEnhansers(applyMiddleware(thunk))
)

