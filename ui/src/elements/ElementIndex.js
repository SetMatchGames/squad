import React from 'react'
import { connect } from 'react-redux'

import { Element } from 'elements/Element'
import { ContributeElementButton } from 'elements/ContributeElementButton'

function ElementIndex(props) {
  return (
    <div className="App-body">
      <h1>{props.title}</h1>
      {ContributeElementButton(props)}
      <ul>{elementList}</ul>
    </div>
  )
}

/**

state = {
  ...
  elementIndexes: {
    Games-Game: {
      title: String,
      elements: {
        elementAddress: { ...element }
      }
    }
    Formats-Format: {
      title: String,
      element: {...}
    }
  }
  ...
}

 */

function mapState(state, ownProps) {
  const indexKey = `${ownProps.title}-${ownProps.elementType}`
  return {
    title: state.title,
    elements: state.elementIndexes
  }
}

export default connect(mapState)(ElementIndex)
