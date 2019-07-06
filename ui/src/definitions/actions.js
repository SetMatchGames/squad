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

export function submitDefinition(definition) {
  return (dispatch) => {
    dispatch(createDefinition(definition))
    metastore.createDefinition(definition).then(
      (address) => createDefinitionSuccess(address, definition),
      (error) => createDefinitionFailure(error, definition)
    )
  }
}

export function createDefinition(definition) {
  return {type: CREATE_DEFINITION, definition}
}

export function createDefinitionSuccess(address, definition) {
  return {type: CREATE_DEFINITION_SUCCESS, address, definition}
}

export function createDefinitionFailure(address, error) {
  return {type: CREATE_DEFINITION_FAILURE, address, error}
}

export function fetchCatalog(definitionType, name) {
  return (dispatch) => {
    dispatch(requestCatalog(definitionType, name))
    metastore.getDefinitionsFromCatalog(definitionType, name)
      .then(definitions => {
        dispatch(receiveCatalog(definitionType, name, definitions))
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
