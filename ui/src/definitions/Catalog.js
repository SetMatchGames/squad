import React from 'react'
import { connect } from 'react-redux'

import { Definition } from './Definition'
import { mapState } from './utils'

function Catalog(props) {
  const definitionList = props.definitions.map(d => {
    if (Object.keys(d.definition)[0] === "Format") {
      d.componentCatalog = props.componentCatalog
    }
    return Definition(d)
  })
  return (
    <div>
      <h1>{props.name}</h1>
      <ul>{definitionList}</ul>
    </div>
  )
}

export default connect(mapState)(Catalog)
