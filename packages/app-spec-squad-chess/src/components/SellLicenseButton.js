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
            console.log('trying to sell', vnode.attrs.license.id, vnode.attrs.license.sellAmount)
            sellLicenseWithAlerts(vnode.attrs.license.id, vnode.attrs.license.sellAmount)
          }
        },
        `Sell (${Number.parseFloat(vnode.attrs.license.sellAmount).toPrecision(4)} MT)`
      )
    )
  }
}

export default SellLicenseButton
