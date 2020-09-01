import m from 'mithril'
import squad from '@squad/sdk'
import state from '../state.js'

const SellDefinitionButton = {
  view: (vnode) => {
    const address = vnode.attrs.address
    const dataType = `sell${address}`
    return m(
      'form.sell-definition',
      m(
        'input[type=number]',
        { value: state.buyingAndSelling[dataType], oninput: handleSaveFactory(dataType) }
      ),
      m(
        'button',
        {
          onclick: (e) => {
            e.preventDefault()
            squad.curationMarket.getSellPrice(state.buyingAndSelling[dataType], address)
              .then((price) => {
                console.log(price)
                squad.curationMarket.sell(state.buyingAndSelling[dataType], address)
              })
          }
        },
        'Sell'
      )
    )
  }
}

const handleSaveFactory = (dataType) => {
  return (event) => {
    state.buyingAndSelling[dataType] = event.target.value
  }
}

export default SellDefinitionButton
