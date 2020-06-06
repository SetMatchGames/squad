import m from 'mithril'
import squad from '@squad/sdk'

import state from './state.js'

const BuyDefinitionForm = {
  oninit: () => {
    state.buyDefinitionForm.units = 0
    state.buyDefinitionForm.definitionAddress = ""
    state.buyDefinitionForm.options = {}
  },
  view: ()  => {
    const form = m(
      'form#buy-definition-form',
      m( )
    )
  }
}

export default BuyDefinitionForm
