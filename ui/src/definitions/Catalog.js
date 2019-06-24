import React from 'react'
import { connect } from 'react-redux'

import { Definition } from 'definitions/Definition'

function Catalog(props) {
  const definitionList = props.definitions.map(e => Definition(e))
  return (
    <div className="App-body">
      <h1>{props.name}</h1>
      <ul>{definitionList}</ul>
    </div>
  )
}

function mapState(state, ownProps) {
  return ownProps.mapState(state)
}

export default connect(mapState)(Catalog)
