import React from 'react'
import { connect } from 'react-redux'

import store from '../../store'

import {
  REQUEST_PLAYER_ONE,
  REQUEST_PLAYER_TWO,

  REQUEST_MOVE_ONE,
  REQUEST_MOVE_TWO,

  REVEAL_WINNER,

  requestPlayerName,
  playerRegistered,
  requestMove,
  moveRecieved,
  revealWinner
} from '../actions'
import { gameStarted, gameFinished } from '../../squad/actions'

function mapState(state) {
  return state.game
}

// action functions
const handleStartGame = (_) => {
  store.dispatch(requestPlayerName(1))
  store.dispatch(gameStarted())
}

const handlePlayer1Registered = (_) => {
  let name = document.getElementById(`player-name`).value
  store.dispatch(playerRegistered(name, 1))
  store.dispatch(requestPlayerName(2))
}

const handlePlayer2Registered = (_) => {
  let name = document.getElementById(`player-name`).value
  store.dispatch(playerRegistered(name, 2))
  store.dispatch(requestMove(1))
}

function GameBoard(props) {
  // action functions that need props
  const handleMove1Received = (_) => {
    handleMove(1)
  }

  const handleMove2Received = (_) => {
    handleMove(2)
  }

  function handleMove(n /* 1 or 2 */) {
    let index = document.getElementById(`move-index`).value
    let component = props.components.list[index].definition.Component
    store.dispatch(moveRecieved(component, n))
    if (n === 1) {
      store.dispatch(requestMove(2))
    } else {
      handleRevealWinner(component)
    }
  }

  const handleRevealWinner = (move2) => {
    let { 
      player1,
      move1,
      player2
    } = props.playSession
    store.dispatch(revealWinner(player1, move1, player2, move2))
    store.dispatch(gameFinished())
  }

  // default render
  if(props.playSession === null) {
    return (
      <div>
        <input type="submit" value="Start Game" onClick={handleStartGame}/>
      </div>
    )
  }
  
  // conditional renders
  switch(props.playSession.status) {
    case REQUEST_PLAYER_ONE:
      // form to request player one
      return (
        <div>
          <label>Enter player 1 name: </label>
          <input type="textfield" id="player-name" defaultValue=""/>
          <input type="submit" value="Register player" onClick={handlePlayer1Registered}/>
        </div>
      )
      
    case REQUEST_PLAYER_TWO:
      return (
        <div>
          Player 1 registered: {props.playSession.player1}.
          <label>Enter player 2 name: </label>
          <input type="textfield" id="player-name" defaultValue=""/>
          <input type="submit" value="Register player" onClick={handlePlayer2Registered}/>
        </div>
      )

    case REQUEST_MOVE_ONE:
      return (
        <div>
          Player 2 registered: {props.playSession.player2}.
          <label>{props.playSession.player1} choose move: </label>
          <select id="move-index">
            {props.components.list.map((component, n) => {
              return (
                <option value={n} key={component.key}>
                  {component.definition.Component.name}
                </option>
              )
            })}
          </select>
          <input type="submit" value="Submit move" onClick={handleMove1Received}/>
        </div>
      )

    case REQUEST_MOVE_TWO:
      return (
        <div>
          {props.playSession.player1}'s move recorded.
          <label>{props.playSession.player2} choose move: </label>
          <select id="move-index">
            {props.components.list.map((component, n) => {
              return (
                <option value={n} key={component.key}>
                  {component.definition.Component.name}
                </option>
              )
            })}
          </select>
          <input type="submit" value="Submit move" onClick={handleMove2Received}/>
        </div>
      )

    case REVEAL_WINNER:
      return (
        <div>
          Result: {props.playSession.winner}
          <input type="submit" value="Start Game" onClick={handleStartGame}/>
        </div>
      )

    default:
      return null
  }
}

export default connect(mapState)(GameBoard)