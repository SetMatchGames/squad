export function mapState(state, ownProps) {
  return ownProps.mapState(state)
}

export function catalogKey(name, definitionType) {
  return `${name}-${definitionType}`
}

export function getComponentNamesFromStateCatalog(componentCatalog, addresses) {
  let unfoundAddresses = addresses
  let componentNames = []

  const checkAddress = (i) => {
    if (unfoundAddresses.includes(i.key)) {
      unfoundAddresses.splice(unfoundAddresses.indexOf(i.key), 1)
      return true
    }
    return false
  }

  componentCatalog.definitions.forEach((i) => {
    if (checkAddress(i) === true) {
      componentNames.push(i.definition.Component.name)
    }
  })

  return componentNames
}