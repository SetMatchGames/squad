let squad = require('../sdk/js')

// connect squad Client
squad.webSocketConnection('ws://localhost:8888')

const roshambo = {
  Game: {
    name: "Roshambo",
    type_: "linux-bash-game-v0",
    data: JSON.stringify({
      cmd: `cat ../app_spec/install_and_run.sh | bash`,
      options: []
    })
  }
}

const components = [
  {
    Component: {
      name: "Rock",
      type_: "Roshambo",
      data: JSON.stringify({
        winsAgainst: ["Scissors"],
        losesAgainst: ["Paper"]
      })
    }
  }, {
    Component: {
      name: "Paper",
      type_: "Roshambo",
      data: JSON.stringify({
        winsAgainst: ["Rock"],
        losesAgainst: ["Scissors"]
      })
    }
  }, {
    Component: {
      name: "Scissors",
      type_: "Roshambo",
      data: JSON.stringify({
        winsAgainst: ["Paper"],
        losesAgainst: ["Rock"]
      })
    }
  }
]

const extraComponents = [
  {
    Component: {
      name: "Lizard",
      type_: "Roshambo",
      data: JSON.stringify({
        winsAgainst: ["Spock", "Paper"],
        losesAgainst: ["Rock", "Scissors"]
      })
    }
  }, {
    Component: {
      name: "Spock",
      type_: "Roshambo",
      data: JSON.stringify({
        winsAgainst: ["Rock", "Scissors"],
        losesAgainst: ["Paper", "Lizard"]
      })
    }
  }
]

squad.on('open', async () => {

  const a = await squad.createElement(roshambo)
  console.log("roshambo address:", a)

  const r = await squad.getElement(a)
  console.log("roshambo retrieved:", r)

  const g = await squad.getAllGames()
  console.log("all games:", g)

  const componentAdds = await Promise.all(
    components.map(async c => {
      return squad.createElement(c)
    })
  )

  console.log("component addresses:", componentAdds)

  const c = await squad.getAllComponents()
  console.log("all components:", c)

  const standard = {
    Format: {
      name: "Standard",
      components: componentAdds
    }
  }

  const f = await squad.createElement(standard)
  console.log("format address:", f)

  const h = await squad.getAllFormats()
  console.log("all formats:", h)

  console.log("standard format components addresses:", h[0].Format.components)

})
