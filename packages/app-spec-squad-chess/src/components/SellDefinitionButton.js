import m from 'mithril'
import squad from '@squad/sdk'

import state from '../state.js'
import { sellWithAlerts } from '../utils.js'

const SellDefinitionButton = {
  oninit: (vnode) => {
    state.buyingAndSelling[`sellPrice${vnode.attrs.address}`] = 0
  },
  view: (vnode) => {
    const address = vnode.attrs.address
    const dataType = `sell${address}`
    return m(
      'form.sell-definition',
      m(
        'input[type=number]',
        { value: state.buyingAndSelling[dataType], oninput: handleSaveSellInfo(address, dataType) }
      ),
      m(
        'button',
        {
          onclick: (e) => {
            e.preventDefault()
            sellWithAlerts(state.buyingAndSelling[dataType], address)
          }
        },
        'Sell Tokens'
      ),
      m(
        '.price',
        'Return: ' + state.buyingAndSelling[`sellPrice${address}`] + ' Wei'
      )
    )
  }
}

const handleSaveSellInfo = (address, dataType) => {
  return (event) => {
    state.buyingAndSelling[dataType] = event.target.value
    squad.curationMarket.getSellPrice(state.buyingAndSelling[dataType], address)
      .then((price) => {
        state.buyingAndSelling[`sellPrice${address}`] = price
        m.redraw()
      })
  }
}

export default SellDefinitionButton
