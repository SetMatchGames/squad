import React from 'react'
import { connect } from 'react-redux'

import store from '../store'
import { submitDefinition, switchDefinitionForm } from './actions'
import { mapState } from './utils'

const handleCreateDefinition = (_) => {
  console.log("creating!")
  const type = document.getElementById(`definition-type`).value
  const fields = document.getElementsByClassName(`definition-field`)
  const definition = {}
  definition[type] = {}
  for (let f of fields) {
    switch(f.id) {
      case "components":
        definition[type][f.id] = f.value.replace(/\s/g, '').split(",")
        break
      default:
        definition[type][f.id] = f.value
    }
  }
  store.dispatch(submitDefinition(definition))
}

const handleSwitchDefinitionForm = (_) => {
  const type = document.getElementById(`definition-type`).value
  store.dispatch(switchDefinitionForm(type))
}

function FormField(props) {
  const fields = {
    name: (
      <div>
        <label>Name:</label><br/>
        <input className="definition-field" id="name"></input><br/>
      </div>
    ),
    type: (
      <div>
        <label>Type:</label><br/>
        <input className="definition-field" id="type_"></input><br/>
      </div>
    ),
    data: (
      <div>
        <label>Data:</label><br/>
        <textarea className="definition-field" id="data"></textarea><br/>
      </div>
    ),
    components: (
      <div>
        <label>Components:</label><br/>
        <textarea className="definition-field" id="components"></textarea><br/>
      </div>
    )
  }
  return fields[props.field]
}

function DefinitionFields(props) {
  return (
    <div>
      {props.fields.map((field, n) => {
        return <FormField key={n} field={field}/>
      })}
    </div>
  )
}

function DefinitionForm(props) {
  return (
    <div>
      <label>Definition type:</label><br/>
      <select id="definition-type" onChange={handleSwitchDefinitionForm}>
        <option value="Game">Game</option>
        <option value="Format">Format</option>
        <option value="Component">Component</option>
      </select><br/>
      <DefinitionFields fields={props.fields || []} />
      <input type="submit" value="Submit" onClick={handleCreateDefinition}/>
    </div>
  )
}

export default connect(mapState)(DefinitionForm)