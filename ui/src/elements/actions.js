/**
 * Element metadata is stored on holochain
 * There are indexes for each of the element types (Game, Format, Component)
 */

import {
  getElementsFromIndex,
  createElement as squadCreateElement
} from "squad-sdk"

export const CREATE_ELEMENT = "CREATE_ELEMENT"
export const CREATE_ELEMENT_SUCCESS = "CREATE_ELEMENT_SUCCESS"
export const CREATE_ELEMENT_FAILURE = "CREATE_ELEMENT_FAILURE"
export const REQUEST_INDEX = "REQUEST_INDEX"
export const RECEIVE_INDEX = "RECEIVE_INDEX"
export const INDEX_FAILURE = "INDEX_FAILURE"

export function submitElement(element) {
  return (dispatch) => {
    dispatch(createElement(element))
    squadCreateElement(element).then(
      (address) => createElementSuccess(address, element),
      (error) => createElementFailure(error, element)
    )
  }
}

export function createElement(element) {
  return {type: CREATE_ELEMENT, element}
}

export function createElementSuccess(address, element) {
  return {type: CREATE_ELEMENT_SUCCESS, address, element}
}

export function createElementFailure(address, error) {
  return {type: CREATE_ELEMENT_FAILURE, address, error}
}

export function fetchIndex(elementType, name) {
  return (dispatch) => {
    dispatch(requestIndex(elementType, name))
    getElementsFromIndex(elementType, name)
      .then(elements => {
        dispatch(receiveIndex(elementType, name, elements))
      })
      .catch(error => {
        dispatch(indexFailure(elementType, name, error))
      })
  }
}

export function requestIndex(elementType, name) {
  return {type: REQUEST_INDEX, elementType, name}
}

export function receiveIndex(elementType, name, elements) {
  return {type: RECEIVE_INDEX, elementType, name, elements}
}

export function indexFailure(elementType, name, error) {
  return {type: INDEX_FAILURE, elementType, name, error}
}
