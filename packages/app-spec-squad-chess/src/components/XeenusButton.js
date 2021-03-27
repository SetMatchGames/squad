import m from 'mithril'
import { curationMarket } from '@squad/sdk'
import { handleAlert } from '../utils.js'

let walletOrSigner

const XeenusButton = {
  oninit: () => {
    walletOrSigner = curationMarket.init()
  },
  view: () => {
    return m(
      '.xeenus',
      m(
        'button',
        {
          onclick: (e) => {
            e.preventDefault()
            console.log('trying to get some Xeenus!')
            // this is the Ropsten address for Xeenus
            const tx = walletOrSigner.sendTransaction({
              to: '0x7E0480Ca9fD50EB7A3855Cf53c347A1b4d6A2FF5',
              value: 0
            })
          }
        },
        `Get XEENUS tokens`
      )
    )
  }
}

export default XeenusButton