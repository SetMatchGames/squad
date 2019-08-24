import React from 'react'
import { connect } from 'react-redux'

function mapState(state) {
  const { components } = state.squad
  return { components }
}

function Components(props) {
  if (props.components === null) { return null }
  if (!Array.isArray(props.components.list)) { return null }
  return (
    <div>
      <h3>Components:</h3>
      {props.components.list.map((component) => {
        return (
          <div key={component.key}>
            <strong>{component.definition.Component.name}</strong>
            <br/>
            {component.definition.Component.data}
          </div>
        )
      })}
    </div>
  )
}

export default connect(mapState)(Components)