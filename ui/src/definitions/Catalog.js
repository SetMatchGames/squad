import React from 'react'
import { connect } from 'react-redux'

import { Definition } from './Definition'
import { mapState } from './utils'

function Catalog(props) {
  let k = 0
  const definitionList = props.definitions.map(e => Definition(
    Object.assign(e, { key: k++ })
  ))
  return (
    <div className="App-body">
      <h1>{props.name}</h1>
      <ul>{definitionList}</ul>
    </div>
  )
}

export default connect(mapState)(Catalog)
