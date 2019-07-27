import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import * as serviceWorker from './serviceWorker'

import { Provider } from 'react-redux'
import store from './store'

import { connectToSquad } from './squad/actions'
import { fetchCatalog, switchDefinitionForm } from './definitions/actions'

(function() {
  var childProcess = require("child_process");
  var oldSpawn = childProcess.spawn;
  function mySpawn() {
      console.log('spawn called');
      console.log(arguments);
      var result = oldSpawn.apply(this, arguments);
      return result;
  }
  childProcess.spawn = mySpawn;
})();

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
)

store.dispatch(connectToSquad(
  'ws://localhost:8888', // TODO make this configurable
  (connection, dispatch) => {
    dispatch(fetchCatalog("Game", "Game Catalog"))
    dispatch(fetchCatalog("Format", "Format Catalog"))
    dispatch(fetchCatalog("Component", "Component Catalog"))
    dispatch(switchDefinitionForm("Game"))
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
