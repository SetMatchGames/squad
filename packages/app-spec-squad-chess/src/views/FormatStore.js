/* global URL, location */

import m from 'mithril'
import state from '../state.js'
import Board from '../components/Board.js'
import BuyDefinitionButton from '../components/BuyDefinitionButton.js'
import SellDefinitionButton from '../components/SellDefinitionButton.js'
import { shortHash, getMarketInfo, previewFormat } from '../utils.js'

const FormatStore = {
  oninit: () => {
    getMarketInfo()
    state.markets.previewedFormats = {}
  },
  view: () => {
    if (!state.squad.rawFormats) { 
      return m(
        '#format-store.body',
        'Loading formats...'
      )
    }
    const orderedFormats = Object.keys(state.squad.rawFormats).sort((a, b) => {
      return state.marketCaps[b] - state.marketCaps[a]
    })
    return m(
      '#format-store.body',
      m('h2', 'Choose a Format to Play'),
      m(Labels),
      orderedFormats.map((address, index) => {
        let order = 'middle'
        if (index === 0) { order = 'head' }
        if (index === orderedFormats.length - 1) {
          order = 'foot'
        }
        return m(FormatCard, { key: address, order })
      })
    )
  }
}

const Labels = {
  view: () => {
    return m(
      '.format-card.labels.row',
      m('.score.offset', 'Market Score'),
      m('.name.offset', 'Name'),
      m('.loader'),
      m('.market-toggle'),
      m('.details-toggle')
    )
  }
}

const FormatCard = {
  view: (vnode) => {
    const name = state.squad.rawFormats[vnode.key].name
    return m(
      `.format-card.column.${vnode.attrs.order}`,
      m(
        '.info.row',
        m('.score.offset', shortenScore(state.marketCaps[vnode.key])),
        m('.name.offset', name),
        m(
          '.button-section', 
          m(Loader, { address: vnode.key }),
          m(DetailsToggle, { address: vnode.key })
        )
      ),
      m(Details, { address: vnode.key })
    )
  }
}

const DetailsToggle = {
  view: (vnode) => {
    const address = vnode.attrs.address
    let content = 'Details'
    if (state.markets.previewedFormats[address]) {
      content = 'Hide'
    }
    return m(
      'form.details-toggle',
      m(
        'button',
        { onclick: handleToggleDetailsFactory(address) },
        content
      )
    )
  }
}

const Details = {
  view: (vnode) => {
    const address = vnode.attrs.address
    if (!state.markets.previewedFormat || 
    state.markets.previewedFormat.address !== address) {
      return
    }
    const num = state.owned[address]
    return m(
      '.details',
      m('.ID', shortHash(address)),
      `(Owned: ${num})`,
      m(BuyDefinitionButton, { address }), 
      m(SellDefinitionButton, { address }),
      m(Board, { format: state.markets.previewedFormat })
    )
  }
}

const Loader = {
  view: (vnode) => {
    const address = vnode.attrs.address
    let owned = false
    if (state.owned[address] > 0) {
      owned = true
    }
    return m(
      'form.loader',
      m(
        'button',
        { onclick: handleLinkFactory(address), disabled: !owned },
        'Play'
      )
    )
  }
}

const handleToggleDetailsFactory = (address) => {
  return (e) => {
    e.preventDefault()
    if (state.markets.previewedFormat && 
    state.markets.previewedFormat.address === address) {
      state.markets.previewedFormat = null
    } else {
      previewFormat(address)
    }
  }
}

const handleLinkFactory = (address) => {
  return (e) => {
    e.preventDefault()
    m.route.set('/matchmaking/:formatAddress', { formatAddress: address })
  }
}

function shortenScore(score) {
  if (!score) { return }
  let result = String(score)
  if (result.length > 7) {
    let count = 0
    let length = result.length
    while (length > 3 && count < 5) {
      result = result.slice(0, -3)
      count += 1
      length -= 3
    }
    let suffix = "K"
    switch (count) {
      case 2:
        suffix = "M"
        break
      case 3:
        suffix = "B"
        break
      case 4:
        suffix = "t"
        break
      default:
    }
    result += suffix
  }
  return result
}

export default FormatStore