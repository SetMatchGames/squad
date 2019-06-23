import React from 'react'
import './App.css'

import { connect } from 'react-redux'

import CreateElementForm from 'elements/CreateElementForm'
import ElementIndex from 'elements/ElementIndex'

function App(props) {
  const elementIndexComponents = Object.keys(props.elementIndexes).map(
    (indexKey) => {
      return (
        <ElementIndex
          key={indexKey}
          mapState={s => s.elementIndexes[indexKey]}
        />
      )
    }
  )
  return (
    <div>
      <div className="App-header">
        SQUAD
      </div>
      <CreateElementForm />
      {elementIndexComponents}
    </div>
  )
}

export default connect(x => x)(App)
