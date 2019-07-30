import findWinner from './findWinner'

export const REGISTER_PLAYER = "REGISTER_PLAYER"
export const START_GAME = "START_GAME"
export const MAKE_MOVE = "MAKE_MOVE"
export const REVEAL_WINNER = "REVEAL_WINNER"

export function registerPlayer(playerName) {
    return { type: REGISTER_PLAYER, playerName }
}

export function startGame() {
    return { type: START_GAME }
}

export function makeMove(component, playerName) {

    return { type: MAKE_MOVE, [`${playerName}-move`]: component }
}

export function revealWinner(p1Name, p1Component, p2Name, p2Component) {
    let winner = findWinner(p1Name, p1Component, p2Name, p2Component)
    return { type: REVEAL_WINNER, winner }
}