import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { squad } from './squad/reducers'
import {  } from './game/reducers'

const composeEnhansers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(
  combineReducers({ squad }),
  composeEnhansers(applyMiddleware(thunk))
)