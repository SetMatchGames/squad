const { curation, metastore, definition } = require('@squad/sdk')

const games = [{
  Game: {
    name: 'App Spec',
    type_: 'web-game-v0',
    data: JSON.stringify({
      url: 'http://localhost:3001'
    })
  }
}]

const components = [{
  Component: {
    name: 'Rock',
    type_: 'Roshambo',
    data: JSON.stringify({
      winsAgainst: ['Scissors'],
      losesAgainst: ['Paper']
    })
  }
}, {
  Component: {
    name: 'Paper',
    type_: 'Roshambo',
    data: JSON.stringify({
      winsAgainst: ['Rock'],
      losesAgainst: ['Scissors']
    })
  }
}, {
  Component: {
    name: 'Scissors',
    type_: 'Roshambo',
    data: JSON.stringify({
      winsAgainst: ['Paper'],
      losesAgainst: ['Rock']
    })
  }
}]

metastore.webSocketConnection('ws://localhost:8888')

let started = false
let done = false
metastore.on('open', async () => {
  await curation.init()
  started = true
  console.log('Connected to metastore')
  const gameAddrs = await Promise.all(games.map(async d => {
    return definition(d)
  })).catch(console.error)
  console.log('created games', gameAddrs)
  const componentAddrs = await Promise.all(components.map(async d => {
    return definition(d)
  })).catch(console.error)
  console.log('created components', componentAddrs)

  const standard = {
    Format: {
      name: 'Standard',
      components: componentAddrs
    }
  }
  const standardAddr = await definition(standard).catch(console.error)
  console.log('created standard format', standardAddr)
  done = true
})

let waitedForMetastore = false
let waitedForDefs = false
function waitUntilDone () {
  console.log(`waited: meta ${waitedForMetastore}, defs ${waitedForDefs}`)
  console.log(`started: ${started}, done ${done}`)
  if (done) {
    console.log('Done waiting for dev defs')
    process.exit(0) // I guess... probably not worth figuring out why its needed
    return
  } else if (!done && !started && !waitedForMetastore) {
    console.log('Waiting a sec for metastore to come up')
    handle = setTimeout(waitUntilDone, 5000)
    waitedForMetastore = true
  } else if (!done && started && !waitedForDefs) {
    console.log('Started: waiting for dev definitions')
    handle = setTimeout(waitUntilDone, 5000)
    waitedForDefs = true
  } else {
    throw new Error('waited too long for metastore/defs')
  }
}

waitUntilDone()
