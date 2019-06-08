import React from 'react'

import { Element } from 'elements/Element'
import { ContributeElementButton } from 'elements/ContributeElementButton'
import { store } from 'store'

export function Elements(props) {
  console.log(store.getState())
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
