import React from 'react'
import './App.css'

import { connect } from 'react-redux'

import FormatSelector from './game/components/FormatSelector'
import Components from './game/components/Components'
import P2pGameBoard from './game/components/P2pGameBoard'
import OpponentSelector from './game/components/OpponentSelector'


function App(props) {
  return (
    <div>
      <h1>Roshambo-Web</h1>
      <OpponentSelector />
      <FormatSelector formats={props.squad.formats} />
      <Components components={props.squad.components}/>
      <P2pGameBoard
        playSession={props.playSession}
        components={props.squad.components}
      />
    </div>
  );
}

export default connect(x => x)(App)
