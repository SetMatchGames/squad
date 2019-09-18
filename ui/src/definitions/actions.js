/**
 * Definition metadata is stored on holochain
 * There are catalogs for each of the definition types (Game, Format, Component)
 */

import { newDefinitionWithBond, metastore } from "squad-sdk"
import store from "../store"
import IPFS from "ipfs"

import * as dotenv from "dotenv"
dotenv.config()
console.log("curve", process.env.SIMPLE_CURVE_ADDR)

export const CREATE_DEFINITION = "CREATE_DEFINITION"
export const CREATE_DEFINITION_SUCCESS = "CREATE_DEFINITION_SUCCESS"
export const CREATE_DEFINITION_FAILURE = "CREATE_DEFINITION_FAILURE"
export const REQUEST_CATALOG = "REQUEST_CATALOG"
export const RECEIVE_CATALOG = "RECEIVE_CATALOG"
export const CATALOG_FAILURE = "CATALOG_FAILURE"
export const SWITCH_DEFINITION_FORM = "SWITCH_DEFINITION_FORM"

const TOPIC = "squad.games/metastore/topic"

const node = new IPFS({
  repo: `squad.games/ipfsRepo/${Math.random()}`,
  EXPERIMENTAL: {
    pubsub: true
  },
  config: {
    Addresses: {
      Swarm: [
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
      ]
    }
  }
})

const submitted = {}

export function shareDefinitions() {
  // when someone sends deffinions, submit them
  // console.log("sharing definitions")
  setTimeout(
    () => {
      node.pubsub.subscribe(TOPIC, (message) => {
        const data = JSON.parse(message.data.toString())
        data.forEach((def) => {
          let key = JSON.stringify(def)
          if (!submitted[key]) {
            // console.log("submitting", def)
            store.dispatch(submitDefinition(def))
            submitted[key] = true
          }
        })
      })
    },
    4000
  )

  // periodically send all the definitions you have
  setInterval(
    () => {
      ["Format", "Game", "Component"].forEach(type => {
        metastore.getAllDefinitionsOfType(type).then(defs => {
          // console.log("publishing", defs)
          node.pubsub.publish(TOPIC, Buffer.from(JSON.stringify(defs), 'utf-8'))
        })
      })
    },
    10000
  )
}

export function submitDefinition(definition) {
  return (dispatch) => {
    dispatch(createDefinition(definition))
    newDefinitionWithBond(definition, '0x8B33b44c0F30ea308821860a2C4a3da85Bf1f3E9', 0, {}).then(
      (address) => {
        if (checkForDuplicate(address, definition)) {
          dispatch(createDefinitionFailure(definition, "Duplicate definition"))
        } else {
          dispatch(createDefinitionSuccess(address, definition))
        }
      },
      (error) => dispatch(createDefinitionFailure(definition, error))
    )
  }
}

export function createDefinition(definition) {
  let definitionType = Object.keys(definition)[0]
  let catalogName = `${definitionType} Catalog`
  return {
    type: CREATE_DEFINITION,
    definition,
    name: catalogName,
    definitionType
  }
}

export function createDefinitionSuccess(address, definition) {
  let definitionType = Object.keys(definition)[0]
  let catalogName = `${definitionType} Catalog`
  return {
    type: CREATE_DEFINITION_SUCCESS,
    definition,
    key: address,
    name: catalogName,
    definitionType
  }
}

export function createDefinitionFailure(definition, error) {
  let definitionType = Object.keys(definition)[0]
  let catalogName = `${definitionType} Catalog`
  return {
    type: CREATE_DEFINITION_FAILURE,
    error,
    definition,
    name: catalogName,
    definitionType
  }
}

export function fetchCatalog(definitionType, name) {
  return (dispatch) => {
    dispatch(requestCatalog(definitionType, name))
    catalogWithKeys(definitionType, name).then(withKeys => {
      if (definitionType === "Format") {
        withFormatComponentNames(withKeys).then(withKeysAndNames => {
          dispatch(receiveCatalog(definitionType, name, withKeysAndNames))
        })
        .catch(error => {
          dispatch(catalogFailure(definitionType, name, error))
        })
      } else {
        dispatch(receiveCatalog(definitionType, name, withKeys))
      }
    })
    .catch(error => {
      dispatch(catalogFailure(definitionType, name, error))
    })
  }
}

export function requestCatalog(definitionType, name) {
  return {type: REQUEST_CATALOG, definitionType, name}
}

export function receiveCatalog(definitionType, name, definitions) {
  return {type: RECEIVE_CATALOG, definitionType, name, definitions}
}

export function catalogFailure(definitionType, name, error) {
  return {type: CATALOG_FAILURE, definitionType, name, error}
}

export function switchDefinitionForm(definitionType, name) {
  return {type: SWITCH_DEFINITION_FORM, definitionType, name}
}

async function getComponents(addresses) {
  let definitions = []
  for (let i in addresses) {
    let definition = {
      definition: await metastore.getDefinition(addresses[i]),
      key: addresses[i]
    }
    definitions.push(definition)
  }
  return definitions
}

async function withFormatComponentNames(formatArray) {
  let compAddrs = []
  formatArray.forEach(item => {
    compAddrs = compAddrs.concat(item.definition.Format.components)
  })
  let components = await getComponents(compAddrs)
  let index = 0
  formatArray.forEach((item, n) => {
    let newComps = {}
    item.definition.Format.components.forEach(address => {
      newComps[address] = components[index].definition.Component.name
      index += 1
    })
    formatArray[n].definition.Format.components = newComps
  })
  return formatArray
}

async function catalogWithKeys(definitionType, name) {
  let definitions = await metastore.getDefinitionsFromCatalog(definitionType, name)
  let addresses = await metastore.getCatalogAddresses(definitionType, name)
  let withKeys = addresses.map(address => {
    let entry = {}
    entry["definition"] = definitions[addresses.indexOf(address)]
    entry["key"] = address
    return entry
  })
  return withKeys
}

function checkForDuplicate(address, definition) {
  let name = Object.keys(definition)[0]
  let keys = store.getState().catalogs[`${name} Catalog-${name}`].definitions.map(d => {
    return d.key
  })
  return keys.includes(address)
}
