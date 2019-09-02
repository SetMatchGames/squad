/**
 * Definition metadata is stored on holochain
 * There are catalogs for each of the definition types (Game, Format, Component)
 */

import { metastore } from "squad-sdk"

export const CREATE_DEFINITION = "CREATE_DEFINITION"
export const CREATE_DEFINITION_SUCCESS = "CREATE_DEFINITION_SUCCESS"
export const CREATE_DEFINITION_FAILURE = "CREATE_DEFINITION_FAILURE"
export const REQUEST_CATALOG = "REQUEST_CATALOG"
export const RECEIVE_CATALOG = "RECEIVE_CATALOG"
export const CATALOG_FAILURE = "CATALOG_FAILURE"
export const SWITCH_DEFINITION_FORM = "SWITCH_DEFINITION_FORM"

export function submitDefinition(definition) {
  return (dispatch) => {
    dispatch(createDefinition(definition))
    metastore.createDefinition(definition).then(
      (address) => dispatch(createDefinitionSuccess(address, definition)),
      (error) => dispatch(createDefinitionFailure(error, definition))
    )
  }
}

export function createDefinition(definition) {
  return {type: CREATE_DEFINITION, definition}
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

export function createDefinitionFailure(address, error) {
  return {type: CREATE_DEFINITION_FAILURE, address, error}
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
      }
      dispatch(receiveCatalog(definitionType, name, withKeys))
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

export function switchDefinitionForm(definitionType) {
  return {type: SWITCH_DEFINITION_FORM, definitionType}
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