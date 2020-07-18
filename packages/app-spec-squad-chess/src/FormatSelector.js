/* global URL, location */

import m from 'mithril'
import state from './state.js'
import BuyDefinitionButton from './BuyDefinitionButton.js'
import SellDefinitionButton from './SellDefinitionButton.js'
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
        return m(FormatCard, { key: address })
      })
    )
  }
}

const FormatCard = {
  view: (vnode) => {
    const address = vnode.key
    const name = `${state.squad.rawFormats[address].name} (${shortHash(address)})`
    return m(
      'p',
      name,
      ` – Market size: ${state.marketCaps[address]}`,
      m(LoadFormatButton, { bondId: address }),
      m(BuyDefinitionButton, { bondId: address }),
      m(SellDefinitionButton, { bondId: address })
    )
  }
}

const LoadFormatButton = {
  view: (vnode) => {
    const bondId = vnode.attrs.bondId
    let owned = false
    let num = 0
    if (state.owned[bondId] > 0) {
      owned = true
      num = state.owned[bondId]
    }
    return m(
      'form.load-format',
      m(
        'button',
        { onclick: handleLinkFactory(bondId), disabled: !owned },
        'Load'
      ),
      `(Owned: ${num})`
    )
  }
}

const handleLinkFactory = (bondId) => {
  return (e) => {
    e.preventDefault()
    const url = new URL(window.location)
    url.search = `?format=${bondId}`
    location.href = url
  }
}

export default FormatSelector
