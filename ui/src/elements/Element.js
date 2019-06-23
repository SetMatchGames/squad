import React from 'react'
//import { connect } from 'react-redux'

import { runGame } from 'squad-sdk'

export function Element(props) {
  console.log("Element component", props)
  return (
    <div>
      {JSON.stringify(props)}
    </div>
  )
}




