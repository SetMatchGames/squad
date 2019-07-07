import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { squad } from './squad/reducers'
import { catalogs } from './definitions/reducers'

/**
state = {
  squad: {...},
  catalogs: {
    Game-Game Catalog: {
      title: String,
      definitions: {
        definitionAddress: { ...definition }
      }
    }
    Format-Format Catalog: {
      title: String,
      definition: {...}
    }
  }
  ...
}

*/

const composeEnhansers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(
  combineReducers({squad, catalogs}),
  composeEnhansers(applyMiddleware(thunk))
)

