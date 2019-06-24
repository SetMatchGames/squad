/**
 * Constructor functions for the element types to be decerialized
 * correctly by the zome
 */

export function Game(name, platform, data) {
  return {Game: {name, platform, data}}
}

export function Format(name, components) {
  return {Format: {name, components}}
}

export function Component(name, type, data) {
  return {Component: {name, type, data}}
}

export const Element = {Game, Format, Component}
export const elementTypes = Object.keys(Element)
