import m from 'mithril'
import state from './state.js'

const FormatSelector = {
  view: () => {
    return m(
      '#format-selector',
      m('h3', 'Available Formats'),
      state.rawFormats.map((rawFormat, index) => {
        const url = new URL(window.location)
        url.search = `?format=${index}`
        return m(`a[href=${url}]`, rawFormat.name)
      })
    )
  }
}

export default FormatSelector
