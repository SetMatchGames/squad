import React from 'react'
import { connect } from 'react-redux'

import { actionPublisher } from '../../lobby/actions'
import { joinGame, playMove } from '../actions'
import { activeGameTopic } from '../utils'
import findWinner from '../findWinner'
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

function IMoved(props) {
  const gameTopic = activeGameTopic(props.activeGames, props.player.info.id)
  return !!props.startedGames[gameTopic].moves[props.player.info.id]
}

function theyMoved(props) {
  const gameTopic = activeGameTopic(props.activeGames, props.player.info.id)
  const them = props.lobby.opponentSelections[props.player.info.id].from
  return !!props.startedGames[gameTopic].moves[them]
}

function P2pGameBoard (props) {
  if (!inActiveGame(props)) {
    return <h3>Game not yet joined</h3>
  }

  if (inActiveGame(props) && !alreadyJoined(props)) {
    store.dispatch(joinGame(
      props.activeGames,
      props.player.info.id,
      props.lobby.node.pubsub
    ))
    return <h3>Joining game</h3>
  }

  let iDidMove = false
  let theyDidMove = false
  try {
    iDidMove = IMoved(props)
    theyDidMove = theyMoved(props)
  } catch (_) {}

  if(iDidMove && theyDidMove) {
    const opponent = props.lobby.opponentSelections[props.player.info.id]
    const gameTopic = activeGameTopic(props.activeGames, props.player.info.id)
    const theirMove = props.startedGames[gameTopic].moves[opponent.from]
    const myMove = props.startedGames[gameTopic].moves[props.player.info.id]
    const winner = findWinner(`${opponent.name} WINS!`, theirMove, "You WIN!", myMove)
    return (
      <div>
        <h3>You played {myMove.name}</h3>
        <h3>{opponent.name} played {theirMove.name}</h3>
        <h1>{winner} BwaBwaBwaaaaaa</h1>
      </div>
    )
  }

  if(iDidMove) {
    const gameTopic = activeGameTopic(props.activeGames, props.player.info.id)
    const myMove = props.startedGames[gameTopic][props.player.info.id]
    return (
      <div>
        <h3>You chose {myMove}</h3>
        <h3>Waiting for them to choose</h3>
      </div>
    )
  }

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
    pubAction(gameTopic, playMove(gameTopic, component))
  }

  if(inActiveGame(props)) {
    return (
      <div>
        <h3> choose move: </h3>
        <select id="move-index">
          {props.components.list.map((component, n) => {
            return (
              <option value={n} key={component.key}>
                {component.definition.Component.name}
              </option>
            )
          })}
        </select>
        <input type="submit" value="Submit move" onClick={handleMove} />
      </div>
    )
  }
  return (
    <div>
      <h3>Something went terribly wrong.</h3>
      <h3>Please donate to 0x76bc4C780Dd85558Bc4B24a4f262f4eB0bE78ca7</h3>
      <h3>As a token of appreciation dispite the failed effort.</h3>
    </div>
  )
}

export default connect(mapState)(P2pGameBoard)
