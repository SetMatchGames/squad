export function getUrlParams(paramNames) {
  let url = window.location.href
  if(!url.includes("?")) { 
      throw new Error("No params provided: squadUri param required to connect to squad.")
  }
  let urlSegments = url.split("?")
  let paramSegment = urlSegments[urlSegments.length - 1]
  let paramArray = paramSegment.split(/[&=]+/)
  const params = {}
  for (let p in paramNames) {
    let paramName = paramNames[p]
    if(paramArray.indexOf(paramName) === -1) { 
      throw new Error(`${paramName} param not provided in URL params.`)
    }
    let param = paramArray[paramArray.indexOf(paramName)+1]
    params[paramName] = param
  }
  return params
}

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