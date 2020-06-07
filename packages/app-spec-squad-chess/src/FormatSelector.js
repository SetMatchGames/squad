/* global URL */

import m from 'mithril'
import state from './state.js'
import BuyDefinitionButton from './BuyDefinitionButton.js'
import squad from '@squad/sdk'

const FormatSelector = {
  view: () => {
    return m(
      '#format-selector',
      m('h3', 'Available Formats'),
      Object.keys(state.squad.rawFormats).map(address => {
        if(state.owned[address]) {
          const url = new URL(window.location)
          url.search = `?format=${address}`
          return m(`a[href=${url}]`, state.squad.rawFormats[address].name)
        } else {
          return m(
            'div',
            state.squad.rawFormats[address].name,
            m(BuyDefinitionButton, { bondId: address })
          )
        }
      })
    )
  }
}

export default FormatSelector
