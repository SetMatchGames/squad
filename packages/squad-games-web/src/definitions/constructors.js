/**
 * Constructor functions for the definition types to be decerialized
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

export const Definition = {Game, Format, Component}
export const definitionTypes = Object.keys(Definition)
