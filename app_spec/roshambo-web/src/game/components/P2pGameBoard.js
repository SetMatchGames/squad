import React from 'react'
import { connect } from 'react-redux'

import { actionPublisher } from '../../lobby/actions'
import { joinGame, playMove } from '../actions'
import { activeGameTopic } from '../utils'
import store from '../../store'

function mapState(state) {
  return {
    ...state.game,
    lobby: state.lobby,
    player: state.lobby.player,
    components: state.squad.components
  }
}

function inActiveGame(props) {
  return props.player.info ?
    !!props.activeGames[props.player.info.id] :
    false
}

function alreadyJoined(props) {
  const gameTopic = activeGameTopic(props.activeGames, props.player.info.id)
  if (!!props.startedGames[gameTopic]) {
    return true
  }
  return false
}

function P2pGameBoard (props) {
  // Game is started when I am in an active game
  function handleMove() {
    console.log("handling move")
    let index = document.getElementById("move-index")
    if (!index) {
      console.warn("no move-index")
      return
    }
    index = index.value
    const component = props.components.list[index].definition.Component
    const gameTopic = activeGameTopic(props.activeGames, props.player.info.id)
    const pubAction = actionPublisher(props.lobby.node.pubsub)
    pubAction(gameTopic, playMove(component))
  }

  if (inActiveGame(props) && !alreadyJoined(props)) {
    store.dispatch(joinGame(
      props.activeGames,
      props.player.info.id,
      props.lobby.node.pubsub
    ))
  }

  if(inActiveGame(props)) {
    return (
      <div>
        <label> choose move: </label>
        <select id="move-index">
          {props.components.list.map((component, n) => {
            return (
              <option value={n} key={component.key}>
                {component.definition.Component.name}
              </option>
            )
          })}
        </select>
        <input type="submit" value="Submit move" onClick={handleMove()} />
      </div>
    )
  }
  return <h3>Game not yet joined</h3>
}

export default connect(mapState)(P2pGameBoard)
