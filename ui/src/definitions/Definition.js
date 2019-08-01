import React from 'react'
//import { connect } from 'react-redux'

import { runGame } from "../sdk/js"

export function Definition(props) {

  const handleRunGame = (_) => {
    runGame(props.definition)
  }

  if (props.definition["Game"] !== undefined) {
    return (
      <div key={props.key}>
        {JSON.stringify(props)}
        <input type="submit" value="Launch" onClick={handleRunGame} />
      </div>
    )
  }

  if (props.definition["Format"] !== undefined) {
    return (
      <div key={props.key}>
        {JSON.stringify(props)}
      </div>
    )
  }

  if (props.definition["Component"] !== undefined) {
    return (
      <div key={props.key}>
        {JSON.stringify(props)}
      </div>
    )
  }

  return (
    <div key={props.key}>
      {JSON.stringify(props)}
    </div>
  )
}