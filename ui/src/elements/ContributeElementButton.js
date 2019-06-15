import React from 'react'

import { store } from 'store'
import { contributeElement } from 'elements/actions'

const handleCreate = (elementType) => (e) => {
  const textarea = document.getElementById(`contribute${elementType}-text`)
  store.dispatch(contributeElement(textarea.value))
}

export function ContributeElementButton(props) {
  return (
    <div>
      <textarea id={`contribute${props.elementType}-text`}></textarea>
      <button onClick={handleCreate(props.elementType)}>Contribute</button>
    </div>
  )
}
