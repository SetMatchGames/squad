import m from 'mithril'
import squad from '@squad/sdk'
import state from './state.js'

const SellDefinitionButton = {
  view: (vnode) => {
    const bondId = vnode.attrs.bondId
    const dataType = `sell${bondId}`
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
            squad.curationMarket.getSellPrice(state.buyingAndSelling[dataType], bondId)
              .then((price) => {
                console.log(price)
                squad.curationMarket.sell(state.buyingAndSelling[dataType], bondId)
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
