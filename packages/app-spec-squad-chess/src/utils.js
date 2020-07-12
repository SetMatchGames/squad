import { stringToSquare } from './rules.js'

export const shortHash = (str) => {
  return `${str.slice(0, 4)}...${str.slice(-4)}`
}

export const findBoardRange = (variableIndex, startingPosition) => {
  let max = 0
  let min = stringToSquare(Object.keys(startingPosition)[0])[variableIndex]
  Object.keys(startingPosition).forEach(str => {
    const variable = stringToSquare(str)[variableIndex]
    if (variable > max) { max = variable }
    if (variable < min) { min = variable }
  })
  return {
    range: max - min,
    min
  }
}
