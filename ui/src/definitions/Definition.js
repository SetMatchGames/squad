import React from 'react'
//import { connect } from 'react-redux'

import { runGame } from 'squad-sdk'

export function Definition(props) {
  return (
    <div key={props.key}>
      {JSON.stringify(props)}
    </div>
  )
}