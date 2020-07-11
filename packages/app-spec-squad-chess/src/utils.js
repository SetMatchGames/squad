import { stringToSquare } from './rules.js'

export const shortHash = (str) => {
  return `${str.slice(0, 4)}...${str.slice(-4)}`
}

export const findBoardRange = (variableIndex, startingPosition) => {
  let max = 0
  let min = 0
  Object.keys(startingPosition).forEach(str => {
    const variable = stringToSquare(str)[variableIndex]
    if (variable > max) { max = variable }
    if (variable < min) { min = variable }
  })
  return max - min
}
