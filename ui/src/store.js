import { createStore, combineReducers, applyMiddleware } from 'redux'
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

export default createStore(
  combineReducers({squad, elementIndexes}),
  applyMiddleware(thunk)
)

