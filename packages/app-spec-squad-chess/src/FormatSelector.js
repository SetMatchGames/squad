import m from "mithril"
import state from "./state.js"

const FormatSelector = {
  view: () => {
    return m(
      '#format-selector',
      m('h3', 'Available Formats'),
      state.rawFormats.map((rawFormat, index) => {
        const url = String(window.location)
        const sectionToCut = String(window.location.search)
        const href = url.slice(0, url.length - sectionToCut.length) + `?format=${index}`
        console.log(href)
        return m(`a[href=${href}]`, rawFormat.name)
      })
    )
  }
}

export default FormatSelector