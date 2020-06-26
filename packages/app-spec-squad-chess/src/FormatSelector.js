/* global URL */

import m from 'mithril'
import state from './state.js'
import BuyDefinitionButton from './BuyDefinitionButton.js'
import { shortHash } from './utils.js'

const FormatSelector = {
  view: () => {
    return m(
      '#format-selector',
      m('h3', 'Available Formats'),
      Object.keys(state.squad.rawFormats).map(address => {
        const name = `${state.squad.rawFormats[address].name} (${shortHash(address)})`
        if (state.owned[address]) {
          const url = new URL(window.location)
          url.search = `?format=${address}`
          return m(`a[href=${url}]`, name)
        } else {
          return m(
            'div',
            name,
            m(BuyDefinitionButton, { bondId: address })
          )
        }
      })
    )
  }
}

export default FormatSelector
