export function shortHash (str) {
  return `${str.slice(0,4)}...${str.slice(-4)}`
}