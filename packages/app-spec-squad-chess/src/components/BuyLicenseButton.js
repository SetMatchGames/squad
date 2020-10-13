import m from 'mithril'
import squad from '@squad/sdk'

import { buyLicenseWithAlerts } from '../utils.js'
import state from '../state.js'

let licensePrice = 10

const BuyLicenseButton = {
  oninit: (vnode) => {
    console.log('Get license price for', vnode.attrs.address)
    state.buyingAndSelling[`buyLicense${vnode.attrs.address}`] = licensePrice
  },
  view: (vnode) => {
    const address = vnode.attrs.address
    const dataType = `buyLicense${address}`
    return m(
      'form.buy-license',
      m(
        'input[type=number]',
        { value: state.buyingAndSelling[dataType], oninput: handleSaveBuyInfo(dataType) }
      ),
      m(
        'button',
        {
          onclick: (e) => {
            e.preventDefault()
            buyLicenseWithAlerts(state.buyingAndSelling[dataType], address)
          }
        },
        'Buy License'
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