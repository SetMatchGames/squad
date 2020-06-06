import m from 'mithril'
import squad from '@squad/sdk'

import state from './state.js'
import settings from './settings.json'
import { mechanics, admechanics } from './rules.js'
import graphicsPaths from './graphics-paths.json'

const ComponentForm = {
  oninit: () => {
    state.componentForm.mechanics = {}
    state.componentForm.admechanics = {}
    state.componentForm.initialBuy = 0
    state.componentForm.value = 0
  },
  view: () => {
    const form = m(
      'form#component-form',
      m(DefinitionFields),
      m(InitialBuyField),
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

const DefinitionFields = {
  view: () => {
    return m(
      '.component-form-field',
      m(ComponentNameField),
      m(ComponentMechanics),
      m(ComponentKing),
      m(ComponentGraphics)
    )
  }
}

const ComponentNameField = {
  view: () => {
    return m(
      '.component-form-field',
      m('label', 'Enter component name:'),
      m(
        'input[type=text]',
        { oninput: handleSaveFactory('name') }
      )
    )
  }
}

const ComponentMechanics = {
  view: () => {
    return m(
      '#component-mechanics',
      m('label', 'Choose mechanics:'),
      Object.keys(mechanics).map(mechanic => {
        return m(
          ComponentMechanic, 
          { key: mechanic, description: mechanics[mechanic] }
        )
      }),
      Object.keys(admechanics).map(admechanic => {
        return m(
          ComponentAdmechanic, 
          { key: admechanic, description: admechanics[admechanic] }
        )
      })
    )
  }
}

const ComponentMechanic = {
  view: (vnode) => {
    let instances = []
    if (state.componentForm.mechanics[vnode.key]) {
      Object.keys(state.componentForm.mechanics[vnode.key]).forEach(key => {
        instances.push(m(
          '.component-form-field',
          m(MechanicOffset, { mechanic: vnode.key, key })
        ))
      })
    }
    return m(
      '.component-form-field',
      vnode.key,
      vnode.attrs.description,
      m(
        'button', 
        { onclick: handleAddMechanicInstanceFactory(vnode.key) },
        'Add instance'
      ),
      instances
    )
  }
}

const MechanicOffset = {
  view: (vnode) => {
    const instance = state.componentForm.mechanics[vnode.attrs.mechanic][vnode.key]
    return m(
      '.mechanic-offset',
      m('h6', 'Enter offset:'),
      m('label', 'X'),
      m(
        `input[type=number][value=${instance.offset[0]}].offset-input`,
        { oninput: handleMechanicOffsetFactory(vnode.attrs.mechanic, vnode.key, 0) }
      ),
      m('label', 'Y'),
      m(
        `input[type=number][value=${instance.offset[1]}].offset-input`,
        { oninput: handleMechanicOffsetFactory(vnode.attrs.mechanic, vnode.key, 1) }
      ),
      m('label', 'Number of steps:'),
      m(
        `input[type=number][value=${instance.steps}].steps-input`,
        { oninput: handleMechanicStepsFactory(vnode.attrs.mechanic, vnode.key) }
      ),
      m(
        'button',
        { onclick: handleDeleteMechanicInstanceFactory(vnode.attrs.mechanic, vnode.key) },
        'Delete instance'
      )
    )
  }
}

const ComponentAdmechanic = {
  view: (vnode) => {
    let form
    if (state.componentForm.admechanics[vnode.key] !== undefined) {
      form = m(
        '.component-form-field',
        m('label', "Enter params (any of ['default', 'self', 'king']):"),
        m(
          `input[type=text][value="${state.componentForm.admechanics[vnode.key]}"]`,
          { oninput: handleAdmechanicParamsFactory(vnode.key) }
        )
      )
    }
    return m(
      '.component-form-field', 
      vnode.key,
      vnode.attrs.description,
      m(
        'input[type=checkbox]',
        { oninput: handleToggleAdmechanicFactory(vnode.key) }
      ),
      form
    )
  }
}

const ComponentKing = {
  view: () => {
    return m(
      '.component-form-field',
      m('label', 'King?'),
      m(
        'input[type=checkbox]',
        { oninput: handleToggleKing }
      )
    )
  }
}

const ComponentGraphics = {
  view: () => {
    return m(
      '.component-form-field', 
      m('label', 'Select graphics:'),
      m(
        '.radio',
        m(GraphicsButtons)
      )
    )
  }
}

const GraphicsButtons = {
  view: () => {
    const buttons = []
    for (const piece in graphicsPaths) {
      buttons.push(
        m(
          '.input[type="radio"]',
          { value: 'hello' }
        ),
        m(
          'label',
          m('img', { 
            src: graphicsPaths[piece].white,
            height: '25vw',
            width: '25vw'
          }),
          m('img', { 
            src: graphicsPaths[piece].black,
            height: '25vw',
            width: '25vw'
          })
        )
      )
    }
    console.log(buttons)
    return buttons
  }
}

// Component Definition type:
/*
{
  String name
  data: {
    mechanics: {
      mechanic name: [
        { offset: [x, y], Number steps }
      ]
    },
    graphics: {
      local: {
        white: path,
        black, path
      }
    }
  }, 
}
*/


const InitialBuyField = {
  view: () => {
    return m(
      '.component-form-field',
      m('label', 'Enter number of tokens to buy:'),
      m(
        'input[type=number][value=0]',
        { oninput: handleSaveInitialBuy }
      ),
      m('#value', `Cost: ${state.componentForm.value}`)
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

const handleAddMechanicInstanceFactory = (mechanic) => {
  return (event) => {
    event.preventDefault()
    if (!state.componentForm.mechanics[mechanic]) {
      state.componentForm.mechanics[mechanic] = {}
    }
    const key = Math.random()
    state.componentForm.mechanics[mechanic][key] = ({
      offset: [0,0],
      steps: 0
    })
  }
}

const handleMechanicOffsetFactory = (mechanic, key, variable) => {
  return (event) => {
    state.componentForm.mechanics[mechanic][key].offset[variable] = parseInt(event.target.value)
  }
}

const handleMechanicStepsFactory = (mechanic, key) => {
  return (event) => {
    state.componentForm.mechanics[mechanic][key].steps = parseInt(event.target.value)
  }
}

const handleDeleteMechanicInstanceFactory = (mechanic, key) => {
  return (event) => {
    event.preventDefault()
    delete state.componentForm.mechanics[mechanic][key]
  }
}

const handleToggleAdmechanicFactory = (admechanic) => {
  return () => {
    if (state.componentForm.admechanics[admechanic]) {
      delete state.componentForm.admechanics[admechanic]
    } else {
      state.componentForm.admechanics[admechanic] = "['default']"
    }
  }
}

const handleAdmechanicParamsFactory = (admechanic) => {
  return (event) => {
    state.componentForm.admechanics[admechanic] = event.target.value
  }
}

const handleToggleKing = () => {
  if (state.componentForm.king) {
    delete state.componentForm.king
  } else {
    state.componentForm.king = true
  }
}

const handleSaveInitialBuy = (event) => {
  state.componentForm.initialBuy = event.target.value
  squad.curationMarket.getBuyPriceFromCurve(0, state.componentForm.initialBuy, state.componentForm.curveAddress).then(res => {
    state.componentForm.value = res
    m.redraw()
  })
}

const handleSubmit = (event) => {
  event.preventDefault()

  // make sure we get the right value before submitting, if not enough time has already passed
  squad.curationMarket.getBuyPriceFromCurve(0, state.componentForm.initialBuy, state.componentForm.curveAddress).then(res => {
    const value = res
    squad.definition(
      definition,
      [ settings.gameAddress ],
      state.componentForm.initialBuy,
      { value },
      state.componentForm.curveAddress
    )
  })
}

export default ComponentForm

