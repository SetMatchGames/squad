import React from 'react'

import { runGame } from 'squad-sdk'

function Game(props) {
  return (
    <div>
      {JSON.stringify(props)}
      <button onClick={runGame(props.address)}>Play</button>
    </div>
  )
}

function Format(props) {
  return (
    <div>
      {JSON.stringify(props)}
    </div>
  )
}

function Component(props) {
  return (
    <div>
      {JSON.stringify(props)}
    </div>
  )
}

export function Element(props) {
  return {
    "Game": Game,
    "Format": Format,
    "Component": Component
  }[props.elementType](props)
}
