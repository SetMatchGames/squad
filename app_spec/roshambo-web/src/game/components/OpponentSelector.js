import React from 'react'
import { connect } from 'react-redux'

import {
  connectToLobby,
  selectOpponent,
  actionPublisher
} from '../../lobby/actions'

import { startGame } from '../actions'

import store from '../../store'

function mapState(state) {
  return {
    opponents: state.lobby.opponents,
    opponentSelections: state.lobby.opponentSelections,
    player: state.lobby.player,
    node: state.lobby.node,
    activeGames: state.game.activeGames
  }
}

function handleInputPlayerName() {
  const displayName = document.getElementById("display-name-input").value
  // TODO refactor display name out of connecting to lobby
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
    const topic = props.opponents[selectedIndex].topicIDs[0]
    const opponent = props.opponents[selectedIndex]
    const pubAction = actionPublisher(props.node.pubsub)
    pubAction(topic, selectOpponent(opponent))
    // If I selected an opponent that selected me, start a game against them
    if (!props.opponentSelections[selectedIndex]) {
      return
    }
    if (props.player.info.id === props.opponentSelections[selectedIndex].from) {
      store.dispatch(startGame(opponent, props.node.pubsub))
    }
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
                  {props.opponents[opponentId].name} {selectedMe(opponentId, props)}
                </option>
              )
            })
        }

      </select>
    </div>
  )
}

function selectedMe(opponentId, props) {
  if (!props.opponentSelections[opponentId]) {
    // return early if there isn't a seleciton for this opponent id
    // so we don't error looking at .from later
    // TODO refactor this whole thing
    return ""
  }
  if (props.opponentSelections[opponentId].from === props.player.info.id) {
    return "*"
  }
  return ""
}

export default connect(mapState)(OpponentSelector)
