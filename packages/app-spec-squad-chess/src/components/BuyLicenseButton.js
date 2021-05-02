import m from 'mithril'

import { buyLicenseWithAlerts } from '../utils.js'
import state from '../state.js'

const BuyLicenseButton = {
  oninit: (vnode) => {
    const purchasePrice = state.squad.rawVariants[vnode.attrs.address].purchasePrice
    state.buyingAndSelling[`buyLicense${vnode.attrs.address}`] = purchasePrice
  },
  view: (vnode) => {
    const address = vnode.attrs.address
    const purchasePrice = state.buyingAndSelling[`buyLicense${vnode.attrs.address}`]
    return m(
      '.buy-license',
      /*
      m(
        'input[type=number]',
        { value: state.buyingAndSelling[dataType], oninput: handleSaveBuyInfo(dataType) }
      ),
      */
      m(
        'button',
        {
          onclick: (e) => {
            e.preventDefault()
            buyLicenseWithAlerts(address)
          }
        },
        `Buy copy for ${purchasePrice} XEENUS`
      )
    )
  }
}
/*
const handleSaveBuyInfo = (dataType) => {
  return (event) => {
    if (event.target.value >= licensePrice) {
      state.buyingAndSelling[dataType] = event.target.value
    }
  }
}
*/
export default BuyLicenseButton
