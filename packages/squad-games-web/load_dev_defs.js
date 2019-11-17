const { curation, metastore, newDefinitionWithBond } = require('@squad/sdk')

const defs = [{
  Game: {
    name: "App Spec",
    type_: "web-game-v0",
    data: JSON.stringify({
      url: "http://localhost:3001"
    })
  }
}, {
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
}]

metastore.webSocketConnection('ws://localhost:8888')


let done = false
let waitTimes = 3
metastore.on('open', async () => {
  await curation.init()
  console.log("Connected to metastore")
  const addrs = await Promise.all(defs.map(async d => {
    return newDefinitionWithBond(d)
  }))
  console.log("created defs", addrs)

  const components = await metastore.getAllDefinitionsOfType("Component")
  console.log("got components", addrs)

  const standard = {
    Format: {
      name: "Standard",
      components: compnents
    }
  }
  await newDefinitionWithBond(standard)
  console.log("created standard format")
  done = true
})

function waitUntilDone() {
  if (!done && waitTimes >= 0) {
    console.log(`Waiting for dev defs ${waitTimes} more times`)
    setTimeout(waitUntilDone, 5000)
    waitTimes -= 1
  } else if (!done) {
    throw new Error("ERR Timeout. Is the metastore running? (make metastore)")
  }
}

waitUntilDone()

