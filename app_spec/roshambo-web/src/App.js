import React from 'react'
import './App.css'

import { connect } from 'react-redux'

import FormatSelector from './game/components/FormatSelector'
import Components from './game/components/Components'
import GameBoard from './game/components/GameBoard'


function App(props) {
  return (
    <div>
      <h1>Roshambo-Web</h1>
      <FormatSelector formats={props.squad.formats} />
      <Components components={props.squad.components}/>
      <GameBoard playSession={props.playSession} components={props.squad.components}/>
    </div>
  );
}

export default connect(x => x)(App)