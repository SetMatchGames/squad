import m from 'mithril'
import { shortHash } from '../utils.js'

import state from '../state.js'
import BuyLicenseButton from './BuyLicenseButton.js'
import SellLicenseButton from './SellLicenseButton.js'

const Licenses = {
  view: (vnode) => {
    const id = vnode.attrs.address
    let licenses
    if (state.licenses[id]) {
      licenses = state.licenses[id].map(license => {
        return m(LicenseCard, { license, address: vnode.attrs.address })
      })
    }
    return [
      m('.row', m('label', 'Licenses:')),
      m(
        '.licenses.column',
        licenses,
        m(BuyLicenseButton, { address: vnode.attrs.address }),
        `Beneficiary fee: ${state.squad.rawFormats[vnode.attrs.address].fee}%`
      )
    ]
  }
}

const LicenseCard = {
  view: (vnode) => {
    const name = state.squad.rawFormats[vnode.attrs.address].name
    return m(
      '.license-card.column',
      m('.row.left', `License ${vnode.attrs.license.id}`),
      m('.row.center', m(
        '.column',
        m('div', name),
        m('div', `ID: ${shortHash(vnode.attrs.license.contribution.id)}`)
      )),
      m(
        '.row.right',
        m(SellLicenseButton, { address: vnode.attrs.address, license: vnode.attrs.license })
      )
    )
  }
}

export default Licenses
