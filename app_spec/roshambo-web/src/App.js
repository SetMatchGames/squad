import React from 'react'
import './App.css'

import { connect } from 'react-redux'

import StartGameForm from './game/components/StartGameForm'
import Components from './game/components/Components'


function App(props) {
  return (
    <div>
      <h1>Roshambo-Web</h1>
      <StartGameForm 
        formats={props.squad.formats} 
        components={props.squad.components} 
      />
    </div>
  );
}

export default connect(x => x)(App)