import React from 'react'
import { connect } from 'react-redux'

import { Element } from 'elements/Element'

function ElementIndex(props) {
  const elementList = props.elements.map(e => Element(e))
  return (
    <div className="App-body">
      <h1>{props.name}</h1>
      <ul>{elementList}</ul>
    </div>
  )
}

function mapState(state, ownProps) {
  return ownProps.mapState(state)
}

export default connect(mapState)(ElementIndex)
