import React from 'react'
import './App.css'

import { connect } from 'react-redux'

import { ElementIndex } from 'elements/ElementIndex'

function App(props) {
  const elementIndexComponents = Object.keys(props.elementIndexes).map(
    (elementType) => {
      return (
        <ul className='elementIndex'>
          <ElementIndex title={props.elementIndexes[elementType].name},
                        elementType={elementType} />
        </ul>
      )
    }
  )
  return (
    <div>
      <div className="App-header">
        SQUAD
      </div>
      {elementIndexComponents}
    </div>
  )
}

function mapProps(state) {
  return state
}

const mapDispatch = {}

export default connect(mapProps, mapDispatch)(App)
