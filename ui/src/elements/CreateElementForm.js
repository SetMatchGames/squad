import React from 'react'

import store from 'store'
import { submitElement } from 'elements/actions'

const handleCreateElement = (_) => {
  const textarea = document.getElementById(`element-text`)
  store.dispatch(submitElement(textarea.value))
}

export default function CreateElementForm(props) {
  return (
    <div>
      <textarea id={`element-text`}></textarea>
      <button onClick={handleCreateElement}>Submit</button>
    </div>
  )
}
