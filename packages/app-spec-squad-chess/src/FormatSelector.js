import m from 'mithril'
import state from './state.js'

const FormatSelector = {
  view: () => {
    return m(
      '#format-selector',
      m('h3', 'Available Formats'),
      Object.keys(state.squad.rawFormats).map(address => {
        const url = new URL(window.location)
        url.search = `?format=${address}`
        return m(`a[href=${url}]`, state.squad.rawFormats[address].name)
      })
    )
  }
}

export default FormatSelector
