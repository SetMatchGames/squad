const swarm = require('discovery-swarm')
const process = require('process')
const getPort = require('get-port-sync')
const readlineSync = require('readline-sync')
const jsonfile = require('jsonfile')
const path = require('path')

// const formats = jsonfile.readFileSync('formats.json')
const componentsArray = jsonfile.readFileSync(
  process.env["SQUAD_COMPONENTS_PATH"]
)

// Format the components in a more convinient way
const components = {}
componentsArray.forEach(c => {
  components[c.Component.name] = c.Component
  components[c.Component.name].data = JSON.parse(c.Component.data)
})

const q = readlineSync.question

const name = q("What is your name? ")

const makeAnnouncement = name => {
  return JSON.stringify({
    action: "announce",
    name
  })
}

const makeOfferMessage = firstMove => {
  return JSON.stringify({
    action: "offer",
    firstMove: firstMove
  })
}

const makeAcceptMessage = (firstMove, secondMove) => {
  return JSON.stringify({
    action: "accept",
    firstMove: firstMove,
    secondMove: secondMove
  })
}

const findWinner = ([p1Name, p1], [p2Name, p2]) => {
  console.log(p1Name, p1, p2Name, p2)
  // Check all the options of which choice wins and loses against the other
  // choice
  if (p1.data.winsAgainst.includes(p2.name)) {
    return p1Name
  }
  if (p2.data.winsAgainst.includes(p1.name)) {
    return p2Name
  }
  if (p1.data.losesAgainst.includes(p2.name)) {
    return p2Name
  }
  if (p2.data.losesAgainst.includes(p1.name)) {
    return p1Name
  }

  // if there is no unique winner:
  return false
}

const gameResult = (yourMove, theirMove) => {
  const winner = findWinner(["you", yourMove], ["them", theirMove])
  return winner ? winner : "Draw"
}


const actions = {
  announce: (connection, message) => {
    console.log(`connected to ${connection.id} AKA ${message.name}`)
    const answer = q("offer them a game? [Y/n] ")
    if (["y", "Y", ""].indexOf(answer) != -1) {
      // they answered yes (or default)
      const myMove = q("Choose a component: ")
      // TODO make this aware of the format, validate that the move is in the format
      console.log(components, myMove, components[myMove])
      connection.write(makeOfferMessage(components[myMove]))
    }
  },
  offer: (connection, message) => {
    // ask the user if they want to play
    const answer = q(`Play with ${connection.id}? [Y/n] `)
    if (["y", "Y", ""].indexOf(answer) != -1) {
      // they answered yes (or default)
      const myMove = q("Choose a component: ")
      // TODO make this aware of the format, validate that the move is in the format
      const acceptMessage = makeAcceptMessage(message.firstMove, components[myMove])
      connection.write(acceptMessage)
      // the game is done, display the result
      console.log(gameResult(message.firstMove, components[myMove]))
    }
  },
  accept: (connection, acceptMessage) => {
    // someone has accepted our offer, the game is done, let's see is the result
    const yourMove = acceptMessage.firstMove
    const theirMove = acceptMessage.secondMove
    console.log(gameResult(yourMove, theirMove))
  }
}

const sw = swarm()
sw.listen(getPort())
sw.join('squad-roshambo')

sw.on('connection', function (connection) {
  connection.on('data', data => {
    try { // try to run the action you were sent
      const message = JSON.parse(data)
      console.log("...", message)
      actions[message.action](connection, message)
    } catch (e) {
      console.log(e)
    }
  })
  connection.write(makeAnnouncement(name))
})

