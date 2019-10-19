import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { squad } from './squad/reducers'
import { game } from './game/reducers'
import { lobby } from './lobby/reducers'

const composeEnhansers =
      typeof window === 'object' &&
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        maxAge: 10,
        latency: 1000
      }) : compose;

export default createStore(
  combineReducers({ squad, game, lobby }),
  composeEnhansers(applyMiddleware(thunk))
)
