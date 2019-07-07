import React from 'react'

import store from '../store'
import { submitDefinition } from './actions'

const handleCreateDefinition = (_) => {
  const textarea = document.getElementById(`definition-text`)
  store.dispatch(submitDefinition(JSON.parse(textarea.value)))
}

export default function CreateDefinitionForm(props) {
  return (
    <div>
      <textarea id={`definition-text`}></textarea>
      <button onClick={handleCreateDefinition}>Submit</button>
    </div>
  )
}
