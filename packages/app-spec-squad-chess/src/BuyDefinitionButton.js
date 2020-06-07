import m from 'mithril'
import squad from '@squad/sdk'

import state from './state.js'

const BuyDefinitionButton = {
  view: (vnode)  => {
    return m(
      'button',
      { onclick: (e) => {
        e.preventDefault()
        squad.curationMarket.getBuyPrice(1, vnode.attrs.bondId)
          .then((price) => {
            squad.curationMarket.buy(1, vnode.attrs.bondId, {value: price})
          })
      }},
      "Buy This Format to Play"
    )
  }
}

export default BuyDefinitionButton
