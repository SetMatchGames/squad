const { metastore, newDefinitionWithBond } = require('squad-sdk')

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

const roshamboWebTest = {
  Game: {
    name: "Roshambo",
    type_: "web-game-v0",
    data: JSON.stringify({
      url: `http://localhost:3001/?squadUri=ws://localhost:8888`,
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

metastore.webSocketConnection('ws://localhost:8888')

metastore.on('open', async () => {

    console.log(metastore)

    // metastore tests
  
    const a = await newDefinitionWithBond(roshambo)
    console.log("roshambo address:", a)
  
    const r = await metastore.getDefinition(a)
    console.log("roshambo retrieved:", r)

    await newDefinitionWithBond(roshamboWebTest)
  
    setTimeout(async () => {
      const g = await metastore.getDefinitionsFromCatalog("Game", "Game Catalog")
      console.log("all games:", g)
    },
    1000)
  
    const componentAdds = await Promise.all(
      components.map(async c => {
        // return metastore.createDefinition(c)
        return newDefinitionWithBond(c)
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

    const rockless = {
      Format: {
        name: "Rockless",
        components: componentAdds.slice(1)
      }
    }
  
    const f = await newDefinitionWithBond(standard)
    console.log("format address:", f)

    const o = await newDefinitionWithBond(rockless)
    console.log("rockless format address:", o)
  
    const z = await metastore.getDefinition(f)
    console.log("standard format retrieved:", z)
  
    setTimeout(async () => {
      const h = await metastore.getAllDefinitionsOfType("Format")
      console.log("all formats:", h)
      console.log("standard format components addresses:", h[0].Format.components)
      metastore.close()
    },
    1000)
  
  })
