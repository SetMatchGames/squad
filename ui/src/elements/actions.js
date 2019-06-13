/**
 * Element metadata is stored on holochain
 * There are indexes for each of the element types (Game, Format, Component)
 * We should have actions for any zome functions we'll be using which is only
 * get_all_`elementType` for now
 */

export const CONTRIBUTE = "CONTRIBUTE"
export const CONTRIBUTING = "CONTRIBUTING"
export const FETCH_ELEMENT_SUCCESS = "FETCH_ELEMENT_SUCCESS"
export const FETCH_ELEMENT_FAIL = "FETCH_ELEMENT_FAIL"
export const FETCH_ELEMENT_LISTS = "FETCH_ELEMENT_LISTS"

export function contributeElement (element) {
  return {type: CONTRIBUTE, element}
}

export function contributeGame (name, runner, data) {
  return contributeElement({Game: {name, runner, data}})
}

export function contributeFormat (name, components) {
  return contributeElement({Format: {name, components}})
}

export function contributeComponent(name, type_, data) {
  return contributeElement({Component: {name, type_, data}})
}

export function fetchElementLists() {
  return {type: FETCH_ELEMENT_LISTS}
}

export function contributing(element) {
  return {type: CONTRIBUTING, element}
}


