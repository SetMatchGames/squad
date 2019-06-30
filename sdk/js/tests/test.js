let squad = require('../index')

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

  // holochain test

  const a = await squad.createDefinition(roshambo)
  console.log("roshambo address:", a)

  const r = await squad.getDefinition(a)
  console.log("roshambo retrieved:", r)

  setTimeout(async () => {
    const g = await squad.getDefinitionsFromCatalog("Game", "Game Catalog")
    console.log("all games:", g)
  },
  1000)

  const componentAdds = await Promise.all(
    components.map(async c => {
      return squad.createDefinition(c)
    })
  )
  console.log("component addresses:", componentAdds)

  setTimeout(async () => {
    const c = await squad.getAllDefinitionsOfType("Component")
    console.log("all components:", c)
  },
  1000)

  const standard = {
    Format: {
      name: "Standard",
      components: componentAdds
    }
  }

  const f = await squad.createDefinition(standard)
  console.log("format address:", f)

  const z = await squad.getDefinition(f)
  console.log("standard format retrieved:", z)

  setTimeout(async () => {
    const h = await squad.getAllDefinitionsOfType("Format")
    console.log("all formats:", h)
    console.log("standard format components addresses:", h[0].Format.components)
  },
  1000)

  // eth test

  web3 = await squad.curationMarket.makeWeb3('ws://localhost:8545')
  console.log("web3")

  const factory = squad.curationMarket.makeFactory('0x2a19231a3ac5e2867be42981b2d26e1ffb6ac8a4')
  console.log("factory")

  const bond = await squad.curationMarket.makeBond(factory)
  console.log("bond")

  var price = await squad.curationMarket.priceToMint(bond, 50)
  console.log(price)

  await squad.curationMarket.mint(bond, 50, price)

  var price = await squad.curationMarket.priceToMint(bond, 50)
  console.log(price)

  await squad.curationMarket.mint(bond, 50, price)

  var price = await squad.curationMarket.priceToMint(bond, 50)
  console.log(price)

  await squad.curationMarket.mint(bond, 50, price)

  var price = await squad.curationMarket.priceToMint(bond, 50)
  console.log(price)

})