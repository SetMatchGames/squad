import m from 'mithril'

import { sellLicenseWithAlerts } from '../utils.js'
import state from '../state.js'

let licensePrice = 10

const SellLicenseButton = {
  oninit: (vnode) => {
    console.log('Get license price for', vnode.attrs.address)
    state.buyingAndSelling[`sellLicense${vnode.attrs.address}`] = licensePrice
  },
  view: (vnode) => {
    const address = vnode.attrs.address
    return m(
      '.sell-license',
      m(
        'button',
        {
          onclick: (e) => {
            e.preventDefault()
            sellLicenseWithAlerts(vnode.attrs.license.licenseId, vnode.attrs.license.sellAmount)
          }
        }, 
        `Sell (${vnode.attrs.license.sellAmount} MT)`
      )
    )
  }
}

export default SellLicenseButton