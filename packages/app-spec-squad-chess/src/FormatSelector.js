/* global URL */

import m from 'mithril'
import state from './state.js'
import BuyDefinitionButton from './BuyDefinitionButton.js'
import { shortHash } from './utils.js'

const FormatSelector = {
  view: () => {
    const orderedFormats = Object.keys(state.squad.rawFormats).sort((a, b) => {
      return state.marketCaps[b] - state.marketCaps[a]
    })
    return m(
      '#format-selector',
      m('h3', 'Available Formats'),
      orderedFormats.map(address => {
        const name = `${state.squad.rawFormats[address].name} (${shortHash(address)})`
        if (state.owned[address]) {
          const url = new URL(window.location)
          url.search = `?format=${address}`
          return m(
            'div',
            m(`a[href=${url}]`, name),
            ` – Market size: ${state.marketCaps[address]}`
          )
        } else {
          return m(
            'div',
            name,
            m(BuyDefinitionButton, { bondId: address }),
            ` – Market size: ${state.marketCaps[address]}`
          )
        }
      })
    )
  }
}

export default FormatSelector
