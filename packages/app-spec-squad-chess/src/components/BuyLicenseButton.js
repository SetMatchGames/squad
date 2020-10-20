import m from 'mithril'
import squad from '@squad/sdk'

import { buyLicenseWithAlerts } from '../utils.js'
import state from '../state.js'

let licensePrice = 10

const BuyLicenseButton = {
  oninit: (vnode) => {
    console.log('Get license price for', vnode.attrs.address)
    const purchasePrice = state.squad.rawFormats[vnode.attrs.address].purchasePrice
    state.buyingAndSelling[`buyLicense${vnode.attrs.address}`] = purchasePrice
  },
  view: (vnode) => {
    const address = vnode.attrs.address
    const purchasePrice = state.buyingAndSelling[`buyLicense${vnode.attrs.address}`]
    const dataType = `buyLicense${address}`
    return m(
      'form.buy-license',
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
        `Buy License for ${purchasePrice} MT`
      )
    )
  }
}

const handleSaveBuyInfo = (dataType) => {
  return (event) => {
    if (event.target.value >= licensePrice) {
      state.buyingAndSelling[dataType] = event.target.value
    }
  }
}

export default BuyLicenseButton