/* global URL, location */

import m from 'mithril'
import state from '../state.js'
import BuyDefinitionButton from '../components/BuyDefinitionButton.js'
import SellDefinitionButton from '../components/SellDefinitionButton.js'
import { shortHash, getMarketInfo } from '../utils.js'

const FormatStore = {
  oninit: () => {
    getMarketInfo()
    state.markets.visible = []
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
      m('h3', 'Choose a Format to Play'),
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
      m('.ID.offset', 'ID'),
      m('.loader'),
      m('.market-toggle')
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
        m('.score.offset', state.marketCaps[vnode.key]),
        m('.name.offset', name),
        m('.ID.offset', shortHash(vnode.key)),
        m(Loader, { address: vnode.key }),
        m(MarketToggle, { address: vnode.key })
      ),
      m(Market, { address: vnode.key })
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

const Market = {
  view: (vnode) => {
    const address = vnode.attrs.address
    if (!state.markets.visible.includes(address)) {
      return
    }
    const num = state.owned[address]
    return m(
      '.market',
      `(Owned: ${num})`,
      m(BuyDefinitionButton, { address }), 
      m(SellDefinitionButton, { address })
    )
  }
}

const MarketToggle = {
  view: (vnode) => {
    const address = vnode.attrs.address
    let content = "Buy / Sell"
    if (state.markets.visible.includes(address)) {
      content = "Hide"
    }
    return m(
      'form.market-toggle',
      m(
      'button',
      { onclick: handleToggleMarketFactory(address) },
      content
      )
    )
  }
}

const handleLinkFactory = (address) => {
  return (e) => {
    e.preventDefault()
    m.route.set('/matchmaking/:formatAddress', { formatAddress: address })
  }
}

const handleToggleMarketFactory = (address) => {
  return (e) => {
    e.preventDefault()
    if (state.markets.visible.includes(address)) {
      console.log('making invisible', address)
      const index = state.markets.visible.indexOf(address)
      state.markets.visible.splice(index, 1)
    } else {
      console.log('making visible', address)
      state.markets.visible.push(address)
    }
  }
}

export default FormatStore