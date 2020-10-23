import m from 'mithril'
import squad from '@squad/sdk'

import { buyWithAlerts } from '../utils.js'
import state from '../state.js'

const BuyDefinitionButton = {
  oninit: (vnode) => {
    state.buyingAndSelling[`buyPrice${vnode.attrs.address}`] = 0
  },
  view: (vnode) => {
    const address = vnode.attrs.address
    const dataType = `buy${address}`
    return m(
      'form.buy-definition',
      m(
        'input[type=number]',
        { value: state.buyingAndSelling[dataType], oninput: handleSaveBuyInfo(address, dataType) }
      ),
      m(
        'button',
        {
          onclick: (e) => {
            e.preventDefault()
            squad.curationMarket.getBuyPrice(state.buyingAndSelling[dataType], address)
              .then((price) => {
                buyWithAlerts(state.buyingAndSelling[dataType], address, { value: price })
              })
          }
        },
        'Buy Tokens'
      ),
      m(
        '.price',
        'Cost: ' + state.buyingAndSelling[`buyPrice${address}`] + ' Wei'
      )
    )
  }
}

const handleSaveBuyInfo = (address, dataType) => {
  return (event) => {
    state.buyingAndSelling[dataType] = event.target.value
    squad.curationMarket.getBuyPrice(state.buyingAndSelling[dataType], address)
      .then((price) => {
        state.buyingAndSelling[`buyPrice${address}`] = price
        m.redraw()
      })
  }
}

export default BuyDefinitionButton
