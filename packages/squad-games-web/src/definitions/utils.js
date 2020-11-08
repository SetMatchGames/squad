export function mapState (state, ownProps) {
  return ownProps.mapState(state)
}

export function catalogKey (name, definitionType) {
  return `${name}-${definitionType}`
}
