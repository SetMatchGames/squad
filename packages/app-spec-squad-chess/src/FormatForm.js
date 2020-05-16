import m from 'mithril'
import squad from '@squad/sdk'

import state from './state.js'
import settings from './settings.json'

const FormatForm = {
  oninit: () => {
    state.formatForm['components'] = []
  },
  view: () => {
    const form = m(
      'form#format-form',
      m(DefinitionFields),
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
      'p#format-form-section',
      m('h3', 'New Format'),
      form
    )
  }
}

const DefinitionFields = {
  view: () => {
    return m(
      '#format-defition-fields',
      m(FormatNameField),
      m(FormatComponentsList),
      m(FormatDataFields)
    )
  }
}

const FormatNameField = {
  view: () => {
    return m(
      '.format-form-field',
      m('label', 'Enter format name:'),
      m(
        'input[type=text]',
        { oninput: handleSaveFactory('name') }
      )
    )
  }
}

const FormatComponentsList = {
  view: () => {
    let componentBoxes = []
    state.squad.components.forEach((c, i) => {
      componentBoxes = componentBoxes.concat([
        m(
          `input.format-form-checkbox[type=checkbox][name=${c.name}][value=${i}]`,
          { oninput: handleAddOrRemoveComponent }
        ),
        m(
          `label[for=${c.name}]`,
          c.name
        )
      ])
    })

    return m(
      '.format-form-field',
      m('label', 'Select components to include:'),
      componentBoxes
    )
  }
}

const FormatDataFields = {
  view: () => {
    return m(
      '#format-data-fields',
      m(FormatStartingPosition),
      m(FormatOrientation)
    )
  }
}

const FormatStartingPosition = {
  view: () => {
    return m(
      '.format-form-field',
      m('label', 'Choose starting position:'),
      m(
        'input[type=text]',
        { oninput: handleSaveFactory('startingPosition') }
      )
    )
  }
}

const FormatOrientation = {
  view: () => {
    return m(
      '.format-form-field',
      m('label', 'Choose orientation for white (0-3):'),
      m(
        'input[type=number][placeholder=2]',
        { oninput: handleSaveFactory('whiteOrientation') }
      ),
      m('label', 'Choose orientation for black (0-3):'),
      m(
        'input[type=number][placeholder=0]',
        { oninput: handleSaveFactory('blackOrientation') }
      )
    )
  }
}

const InitialBuyField = {
  view: () => {
    return m(
      '.format-form-field',
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
      '.format-form-field',
      m('label', 'Enter transaction options:'),
      m(
        'input[type=text][placeholder=Leave blank!]',
        { oninput: handleSaveFactory('options') }
      )
    )
  }
}

const CurveAddressField = {
  view: () => {
    return m(
      '.format-form-field',
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
    state.formatForm[dataType] = event.target.value
  }
}

const handleAddOrRemoveComponent = (event) => {
  const component = state.squad.components[event.target.value]
  if (state.formatForm.components.includes(component)) {
    const index = state.formatForm.components.indexOf(component)
    state.formatForm.components.pop(index)
  } else {
    state.formatForm.components.push(component)
  }
}

const handleSubmit = (event) => {
  event.preventDefault()
  // build the definition
    // elements of a squad chess format
    // name (string)
    // components [array of addresses]
    // data: stringified JSON:
      // starting position
      // orientation
  const definition = {
    name: state.formatForm.name,
    components: state.formatForm.components,
    data: JSON.stringify({
      startingPosition: state.formatForm.startingPosition,
      orientation: state.formatForm.orientation
    })
  }
  squad.definition(
    definition,
    [ settings.gameAddress ],
    state.formatForm['initialBuy'],
    state.formatForm['options'],
    state.formatForm['curveAddress']
  )
}

export default FormatForm