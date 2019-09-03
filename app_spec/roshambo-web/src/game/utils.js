export function activeGameTopic(activeGames, playerId) {
  const gameId = activeGames[playerId]
  return `squad.games/games/${gameId}`
}
