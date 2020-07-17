import m from 'mithril'
import squad from '@squad/sdk'
import state from './state.js'

const BuyDefinitionButton = {
  view: (vnode) => {
    const bondId = vnode.attrs.bondId
    const dataType = `buy${bondId}`
    return m(
      'form.buy-definition',
      m(
        'input[type=number]',
        { value: state.buyingAndSelling[dataType], oninput: handleSaveFactory(dataType) }
      ),
      m(
        'button',
        {
          onclick: (e) => {
            e.preventDefault()
            squad.curationMarket.getBuyPrice(state.buyingAndSelling[dataType], bondId)
              .then((price) => {
                console.log(price)
                squad.curationMarket.buy(state.buyingAndSelling[dataType], bondId, { value: price })
              })
          }
        },
        'Buy'
      )
    )
  }
}

const handleSaveFactory = (dataType) => {
  return (event) => {
    state.buyingAndSelling[dataType] = event.target.value
  }
}

export default BuyDefinitionButton
