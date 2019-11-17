let metastore = require('./index')

// connect squad Client
//metastore.webSocketConnection('ws://localhost:8888')

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

// TODO: these tests shouldn't be testing the zome functions, only that the right inputs are going into them
  // This way, we will not need to run or mock a conductor in order to run these tests

metastore.webSocketConnection('ws://localhost:8888')

test("Submit and retrieve definition", () => {
  metastore.on('open', async () => {
    const a = await metastore.createDefinition(roshambo)
    const r = await metastore.getDefinition(a)
    await expect(r).toStrictEqual(roshambo)
    metastore.close()
  })
})

test("Get game catalog", () => {
  metastore.on('open', async () => {
    const g = await metastore.getDefinitionsFromCatalog("Game", "Game Catalog")
    await expect(g[0]).toStrictEqual("roshambo")
    metastore.close()
  })
})

/*
metastore.on('open', async () => {
  // metastore tests
  console.log("TESTING METASTORE API...")

  const a = await metastore.createDefinition(roshambo)
  console.log("roshambo address:", a)

  const r = await metastore.getDefinition(a)
  console.log("roshambo retrieved:", r)

  setTimeout(async () => {
    const g = await metastore.getDefinitionsFromCatalog("Game", "Game Catalog")
    console.log("all games:", g)
  },
  1000)

  const componentAdds = await Promise.all(
    components.map(async c => {
      return metastore.createDefinition(c)
    })
  )
  console.log("component addresses:", componentAdds)

  setTimeout(async () => {
    const c = await metastore.getAllDefinitionsOfType("Component")
    console.log("all components:", c)
  },
  1000)

  const standard = {
    Format: {
      name: "Standard",
      components: componentAdds
    }
  }

  const f = await metastore.createDefinition(standard)
  console.log("format address:", f)

  const z = await metastore.getDefinition(f)
  console.log("standard format retrieved:", z)

  setTimeout(async () => {
    const h = await metastore.getAllDefinitionsOfType("Format")
    console.log("all formats:", h)
    console.log("standard format components addresses:", h[0].Format.components)
  },
  1000)

})
*/
