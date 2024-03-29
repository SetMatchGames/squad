import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'

import { Provider } from 'react-redux'
import store from './store'

import { connectToSquad } from './squad/actions'
import {
  fetchCatalog,
  switchDefinitionForm,
  shareDefinitions
} from './definitions/actions'

export default function startApp (elem) {
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    elem
  )

  store.dispatch(connectToSquad(
    'ws://localhost:8888', // TODO make this configurable
    (connection, dispatch) => {
      dispatch(fetchCatalog('Game', 'Game Catalog'))
      dispatch(fetchCatalog('Component', 'Component Catalog'))
      dispatch(fetchCatalog('Format', 'Format Catalog'))
      dispatch(switchDefinitionForm('Game', 'Game Catalog'))
      shareDefinitions()
    },
    (error, dispatch) => {
      console.warn(error)
    },
    console.log // messageCallback
  ))

  // If you want your app to work offline and load faster, you can change
  // unregister() to register() below. Note this comes with some pitfalls.
  // Learn more about service workers: https://bit.ly/CRA-PWA
  serviceWorker.unregister()
}

startApp(document.getElementById('root'))
