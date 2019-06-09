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
  // get basic instance information
  let method = 'info/instances'
  let info = await squad.call(method, {})
  console.log(info)
  const instanceId = info[0].id
  const agentId = info[0].agent

  const contributeElement = async e => {
    console.log("contributing...")
    const result = JSON.parse(await squad.call(
      'call',
      {
        instance_id: instanceId,
        zome: "elements",
        function: "create_element",
        args: {
          element: e
        }
      }
    ))
    return result.Ok
  }

  // TODO add all the indices
  const b = await contributeElement(roshambo)
  console.log(b)

  /*
  const indexAddresses = await Promise.all(
    indices.map(contributeIndex)
  )
  console.log(indexAddresses)
  // add a game element
  const roshamboAddress = await contributeElement(roshambo, indexAddresses[0])
  // add all the components
  const standardComponentAddresses = await Promise.all(
    components.map(contributeElement, indexAddresses[2])
  )

  const standardFormat = await contributeElement(
    {
      Format: {
        name: "Standard",
        components: standardComponentAddresses
      }
    },
    indexAddresses[1]
  )

  console.log("running the game", roshamboAddress, standardFormat)
  // try running the game
  squad.runGame(roshamboAddress, standardFormat)
  */
})
