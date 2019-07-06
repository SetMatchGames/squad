let squad = require('../index')

// connect squad Client
squad.metastore.webSocketConnection('ws://localhost:8888')

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


squad.metastore.on('open', async () => {

  // metastore tests

  const a = await squad.metastore.createDefinition(roshambo)
  console.log("roshambo address:", a)

  const r = await squad.metastore.getDefinition(a)
  console.log("roshambo retrieved:", r)

  setTimeout(async () => {
    const g = await squad.metastore.getDefinitionsFromCatalog("Game", "Game Catalog")
    console.log("all games:", g)
  },
  1000)

  const componentAdds = await Promise.all(
    components.map(async c => {
      return squad.metastore.createDefinition(c)
    })
  )
  console.log("component addresses:", componentAdds)

  setTimeout(async () => {
    const c = await squad.metastore.getAllDefinitionsOfType("Component")
    console.log("all components:", c)
  },
  1000)

  const standard = {
    Format: {
      name: "Standard",
      components: componentAdds
    }
  }

  const f = await squad.metastore.createDefinition(standard)
  console.log("format address:", f)

  const z = await squad.metastore.getDefinition(f)
  console.log("standard format retrieved:", z)

  setTimeout(async () => {
    const h = await squad.metastore.getAllDefinitionsOfType("Format")
    console.log("all formats:", h)
    console.log("standard format components addresses:", h[0].Format.components)
  },
  1000)

  // curation market tests

  web3 = await squad.curationMarket.makeWeb3('ws://localhost:8545')
  console.log("web3")

  const factory = squad.curationMarket.makeFactory(process.env.FACTORY_ADDR)
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