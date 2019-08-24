import React from 'react'
import { connect } from 'react-redux'

import { selectOpponent } from '../../squad/actions'
import store from '../../store'

function mapState(state) {
  return {opponents: [], state}
  return {opponents: state.opponents}
}

function OpponentSelector(props) {
  console.log("rendering opponents selector with:", props)

  const handleSelectOpponent = () => {
    console.log("handleSelectOpponent", props)
    return

    const select = document.getElementById('opponent-select-list')
    let selectedIndex = 0
    if (!!select) { selectedIndex = select.value }
    store.dispatch(selectOpponent(props.opponents[selectedIndex]))
  }

  return (
    <div>
      <h3>Choose an opponent.</h3>
      <label>Opponent: </label>
      <select
        id="opponent-select-list"
        onChange={handleSelectOpponent()}
      >
        {props.opponents.map((opponent, n) => {
          return (
            <option value={n} key={opponent.address}>
              {opponent.name}
            </option>
          )
        })}
      </select>
    </div>
  )
}

export default connect(mapState)(OpponentSelector)
