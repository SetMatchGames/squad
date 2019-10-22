export function addActionToState(action, state) {
  action.status = action.type
  let newState = Object.assign(
    {},
    state,
    action
  )
  delete newState.type
  return newState
}
