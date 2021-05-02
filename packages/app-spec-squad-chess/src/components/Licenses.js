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
    } else {
      return [
        m(
          '.licenses.column',
          m(BuyLicenseButton, { address: vnode.attrs.address })
        )
      ]
    }
    return [
      m('.row', m('label', 'Owned copies:')),
      m(
        '.licenses.column',
        licenses,
        m(BuyLicenseButton, { address: vnode.attrs.address })
      )
    ]
  }
}

const LicenseCard = {
  view: (vnode) => {
    const name = state.squad.rawVariants[vnode.attrs.address].name
    return m(
      '.license-card.column',
      m('.row.center', name), // TODO make full ID copiable
      m('.row.center', m(
        '.column',
        m('div', `Copy: ${Number(vnode.attrs.license.id)}`),
        m('div', `Owner: ${shortHash(state.squad.account)}`)
      )),
      m(
        '.row.center',
        m(SellLicenseButton, { address: vnode.attrs.address, license: vnode.attrs.license })
      )
      // TODO button that takes you to view the NFT on opensea
    )
  }
}

export default Licenses
