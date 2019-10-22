import React from 'react'

import { runGame } from "@squad/sdk"

function DefinitionInfo(props) {
  return (
    <div>
      {Object.keys(props.definition).map((fieldName, n) => {
        return (
          <div key={n}>
            <span><strong>{fieldName}</strong>: </span>
            {JSON.stringify(props.definition[fieldName])}
          </div>
        )
      })}
      <div>
        <strong>address</strong>: {props.address}
      </div>
    </div>
  )
}

export function Definition(props) {

  const handleRunGame = (_) => {
    runGame(props.definition)
  }

  if (props.definition["Game"] !== undefined) {
    let launchButton = null
    if (props.definition["Game"]["type_"] === "web-game-v0") {
      launchButton = <input type="submit" value="Launch" className="Launch-button" onClick={handleRunGame} />
    }

    return (
      <div className="Definition" key={props.key}>
        <DefinitionInfo definition={props.definition.Game} address={props.key} />
        {launchButton}
        <br/>
      </div>
    )
  }

  if (props.definition["Format"] !== undefined) {
    return (
      <div className="Definition" key={props.key}>
        <DefinitionInfo definition={props.definition.Format} address={props.key} />
        <br/>
      </div>
    )
  }

  if (props.definition["Component"] !== undefined) {
    return (
      <div className="Definition" key={props.key}>
        <DefinitionInfo definition={props.definition.Component} address={props.key} />
        <br/>
      </div>
    )
  }

  return (
    <div className="Definition" key={props.key}>
      {JSON.stringify(props)}
      <br/>
    </div>
  )
}
