import React from 'react'
import { connect } from 'react-redux'

import { connectToLobby, selectOpponent } from '../../squad/actions'
import store from '../../store'

function mapState(state) {
  return {
    opponents: state.squad.opponents,
    player: state.squad.player
  }
}

function handleInputPlayerName() {
  const displayName = document.getElementById("display-name-input").value
  store.dispatch(connectToLobby(displayName, "roshambo"))
}

function OpponentSelector(props) {
  if (props.player.name === undefined) {
    return (
      <div>
        <label>
          To get started, submit a display name:
          <input id="display-name-input" type="text" />
        </label>
        <input
          type="submit"
          value="Join lobby"
          onClick={handleInputPlayerName}
        />
      </div>
    )
  }
  if (props.opponents === undefined) {
    return <div><h3>Waiting for opponents</h3></div>
  }

  const handleSelectOpponent = () => {
    const select = document.getElementById('opponent-select-list')
    let selectedIndex = 0
    if (!!select) { selectedIndex = select.value }
    store.dispatch(selectOpponent(props.opponents[selectedIndex]))
  }

  return (
    <div>
      <h3>{props.player.name}, choose an opponent.</h3>
      <h4>Players in lobby: {Object.keys(props.opponents).length}</h4>
      <label>Opponent: </label>
      <select
        id="opponent-select-list"
        onChange={handleSelectOpponent}
        >
        <option>Select an Opponent</option>
        {
          Object.keys(props.opponents)
            .filter((id) => { return id !== props.player.info.id})
            .map((opponentId) => {
              return (
                <option value={opponentId} key={opponentId}>
                  {props.opponents[opponentId].name}
                </option>
              )
            })
        }

      </select>
    </div>
  )
}

export default connect(mapState)(OpponentSelector)
