import m from 'mithril'
import squad from '@squad/sdk'

import state from './state.js'
import settings from './settings.json'

const ComponentForm = {
  view: () => {
    const form = m(
      'form#component-form',
      m(DefinitionField),
      m(InitialBuyField),
      m(OptionsField),
      m(CurveAddressField),
      m(
        'button',
        { onclick: handleSubmit },
        'Submit new definition'
      )
    )
    return m(
      'p#component-form-section',
      m('h3', 'New Component'),
      form
    )
  }
}

const DefinitionField = {
  view: () => {
    return m(
      '.component-form-field',
      m('label', 'Enter Definition:'),
      m(
        'input[type=text]',
        { oninput: handleSaveFactory('definition') }
      ),
    )
  }
}

const InitialBuyField = {
  view: () => {
    return m(
      '.component-form-field',
      m('label', 'Enter number of tokens to buy:'),
      m(
        'input[type=number][placeholder=0]',
        { oninput: handleSaveFactory('initialBuy') }
      )
    )
  }
}

const OptionsField = {
  view: () => {
    return m(
      '.component-form-field',
      m('label', 'Enter transaction options:'),
      m(
        'input[type=text]',
        { oninput: handleSaveFactory('options') }
      )
    )
  }
}

const CurveAddressField = {
  view: () => {
    return m(
      '.component-form-field',
      m('label', 'Enter curve address:'),
      m(
        'input[type=number][placeholder=Leave blank!]',
        { oninput: handleSaveFactory('curveAddress') }
      )
    )
  }
}

// handlers
const handleSaveFactory = (dataType) => {
  return (event) => {
    state.componentForm[dataType] = event.target.value
  }
}

const handleSubmit = (event) => {
  event.preventDefault()
  squad.definition(
    JSON.parse(state.componentForm['definition']),
    [ settings.gameAddress ],
    state.componentForm['initialBuy'],
    state.componentForm['options'],
    state.componentForm['curveAddress']
  )
}

export default ComponentForm

