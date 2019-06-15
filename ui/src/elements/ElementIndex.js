import React from 'react'
import { connect } from 'react-redux'

import { Element } from 'elements/Element'
import { ContributeElementButton } from 'elements/ContributeElementButton'

function ElementIndex(props) {
  const elementList = [].map(
    element => {
      element.elementType = props.elementType
      return (
      <li key={element.address}>
        {Element(element)}
      </li>
    )}
  )
  console.log(elementList)
  return (
    <div className="App-body">
      <h1>{props.title}</h1>
      {ContributeElementButton(props)}
      <ul>{elementList}</ul>
    </div>
  )
}

function mapState(state, ownProps) {

}

const mapDispatch = {}

export default connect(mapState, mapDispatch)(ElementIndex)
