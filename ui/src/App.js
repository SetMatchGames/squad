import React from 'react';
import logo from './logo.svg';
import './App.css';
import ReactDOM from 'react-dom';

import { runGame, webSocketConnection } from 'squad-sdk'

webSocketConnection("ws://localhost:8888")

let state = {
  "Game": [
    {
      address: "g1address",
      name: "g1Name",
      type_: "linux-pash-game-v0",
      data: JSON.stringify({
        "cmd": `cat ../app_spec/install_and_run.sh | bash`,
        "options": []
      })
    },
    {
      address: "g2address",
      name: "g2Name",
      type_: "linux-pash-game-v0",
      data: JSON.stringify({
        "cmd": `cat ../app_spec/install_and_run.sh | bashify`,
        "options": []
      })
    }
  ],
  "Format": [
    {
      address: "f1",
      name: "format1",
      components: ["Rockaddress", "paperAddress"]
    },
    {
      address: "f2",
      name: "ROCKALWAYSWINS",
      components: ["Rockaddress"]
    }
  ],
  "Component": [
    {
      address: "Rockaddress",
      name: "Rock",
      type_: "Roshambo",
      data: JSON.stringify({
        winsAgainst: ["Scissors"],
        losesAgainst: ["Paper"]
      })
    }, {
      address: "paperAddress",
      name: "Paper",
      type_: "Roshambo",
      data: JSON.stringify({
        winsAgainst: ["Rock"],
        losesAgainst: ["Scissors"]
      })
    }
  ]
}

function getAllElements(elementType) {
  console.log(elementType, state[elementType])
  return state[elementType]
}

const handleContribute = (elementType) => (e) => {
  const element = document.getElementById(`contribute${elementType}-text`)
  state[elementType].push(element.value)
  ReactDOM.render(<App />, document.getElementById('root'));
}

function ContributeElement(props) {
  return (
    <div>
      <textarea id={`contribute${props.elementType}-text`}></textarea>
      <button onClick={handleContribute(props.elementType)}>Contribute</button>
    </div>
  )
}

const handleRunGame = (gameAddress) => (e) => {
  runGame(gameAddress)
}

function Game(props) {
  return (
    <div>
      {JSON.stringify(props)}
      <button onClick={handleRunGame(props.address)}>Play</button>
    </div>
  )
}

function Format(props) {
  return (
    <div>
      {JSON.stringify(props)}
    </div>
  )
}

function Component(props) {
  return (
    <div>
      {JSON.stringify(props)}
    </div>
  )
}

function Element(props) {
  return {
    "Game": Game,
    "Format": Format,
    "Component": Component
  }[props.elementType](props)
}

function Elements(props) {
  const elementList = getAllElements(props.elementType).map(
    element => {
      element.elementType = props.elementType
      return (
      <li key={element.address}>
        {Element(element)}
      </li>
    )}
  )
  console.log(elementList)
  return (
    <div>
      <h1>{props.title}</h1>
      {ContributeElement(props)}
      <ul>{elementList}</ul>
    </div>
  )
}

function App() {
  return (
    <div>
      <Elements elementType="Game" title="Games"/>
      <Elements elementType="Format" title="Formats"/>
      <Elements elementType="Component" title="Components"/>
    </div>
  );
}

export default App;
