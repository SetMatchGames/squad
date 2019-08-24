import React from 'react'
import { connect } from 'react-redux'

import { selectFormat } from '../../squad/actions'
import store from '../../store'

function mapState(state) {
  const { formats } = state.squad
  return { formats }
}

function StartGameForm(props) {
  console.log("start props", props)
  if (props.formats === null) { return null }
  if (!Array.isArray(props.formats.list)) { return null }
  if (props.formats.status === "GAME_STARTED") { return null }

  const handleSelectFormat = (_) => {
    const select = document.getElementById('format-select-list')
    let selectedIndex = 0
    if(!!select) { selectedIndex = select.value }
    store.dispatch(selectFormat(selectedIndex, props.formats.list))
  }

  return (
    <div>
      <h3>Choose a format and click 'Start Game' to play.</h3>
      <label>Format: </label>
      <select id="format-select-list" onChange={handleSelectFormat}>
        {props.formats.list.map((format, n) => {
          return (
            <option value={n} key={format.key}>
              {format.definition.Format.name}
            </option>
          )
        })}
      </select>
    </div>
  )
}

export default connect(mapState)(StartGameForm)