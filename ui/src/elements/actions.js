/**
 * Element metadata is stored on holochain
 * There are indexes for each of the element types (Game, Format, Component)
 */

import { getIndex, createElement } from "squad-sdk"

export const CREATE_ELEMENT = "CREATE_ELEMENT"
export const CREATE_ELEMENT_SUCCESS = "CREATE_ELEMENT_SUCCESS"
export const CREATE_ELEMENT_FAILURE = "CREATE_ELEMENT_FAILURE"
export const REQUEST_INDEX = "REQUEST_INDEX"
export const RECEIVE_INDEX = "RECEIVE_INDEX"
export const INDEX_FAILURE = "INDEX_FAILURE"

export function contributeElement(element) {
  return (dispatch) => {
    dispatch(createElement(element))
    createElement(element).then(
      (address) => createElementSuccess(address, element),
      (error) => createElementFailure(error, element)
    )
  }
}

export function createElementSuccess(address, element) {
  return {type: CREATE_ELEMENT_SUCCESS, address, element}
}

export function createElementFailure(address, error) {
  return {type: CREATE_ELEMENT_FAILURE, address, error}
}

export function fetchIndex(name, elementType) {
  return (dispatch) => {
    dispatch(requestIndex(name, elementType))
    getIndex(name, elementType)
      .then(elements => {
        dispatch(receiveIndex(name, elementType, elements))
      })
      .catch(error => {
        dispatch(indexFailure(name, elementType, error))
      })
  }
}

export function requestIndex(name, elementType) {
  return {type: REQUEST_INDEX, name, elementType}
}

export function receiveIndex(name, elementType, elements) {
  return {type: RECEIVE_INDEX, name, elementType, elements}
}

export function indexFailure(name, elementType, error) {
  return {type: INDEX_FAILURE, name, elementType, error}
}
