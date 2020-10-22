import m from 'mithril'

import { sellLicenseWithAlerts } from '../utils.js'
import state from '../state.js'

const licensePrice = 10

const SellLicenseButton = {
  oninit: (vnode) => {
    state.buyingAndSelling[`sellLicense${vnode.attrs.address}`] = licensePrice
  },
  view: (vnode) => {
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
