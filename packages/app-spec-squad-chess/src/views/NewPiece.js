/* global localStorage */

import m from 'mithril'
import squad from '@squad/sdk'

import state from '../state.js'
import settings from '../settings.js'
import { mechanics, admechanics } from '../rules.js'
import graphicsPaths from '../graphics-paths.json'
import { shortHash, getMarketInfo } from '../utils.js'

const ComponentForm = {
  oninit: () => {
    getMarketInfo()
    clearForm()
  },
  view: () => {
    const form = m(
      'form#component-form',
      m(ComponentPreloader),
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
      '#component-form.body',
      m('h2', 'New Component'),
      form
    )
  }
}

const ComponentPreloader = {
  view: () => {
    let content = 'Loading...'
    if (state.squad.components) {
      content = m(
        '.component.form-field',
        Object.keys(state.squad.components).map(key => {
          return m(ComponentButton, {
            key,
            name: `${state.squad.components[key].name} (${shortHash(key)})`
          })
        }),
        m(
          'button',
          { onclick: handleClearForm },
          'Clear'
        )
      )
    }
    return content
  }
}

const ComponentButton = {
  view: (vnode) => {
    return m(
      'button',
      { value: vnode.key, onclick: handleLoadComponent },
      vnode.attrs.name
    )
  }
}

const DefinitionFields = {
  view: () => {
    return m(
      '.component.definition',
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
      '.component.form-field',
      'Component name: ',
      m(
        'input[type=text]',
        { value: state.componentForm.name, oninput: handleSaveFactory('name') }
      )
    )
  }
}

const ComponentMechanics = {
  view: () => {
    return m(
      '.component.form-field',
      m('p', 'Mechanics: '),
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
    const instances = []
    if (state.componentForm.mechanics[vnode.key]) {
      Object.keys(state.componentForm.mechanics[vnode.key]).forEach(key => {
        instances.push(
          m(MechanicOffset, { mechanic: vnode.key, key })
        )
      })
    }
    return m(
      '.component.mechanic',
      `"${vnode.key}" – `,
      m('span.italics', vnode.attrs.description),
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
      '.component.mechanic-params.indented',
      m('label', 'X: '),
      m(
        `input[type=number][value=${instance.offset[0]}].offset-input`,
        { oninput: handleMechanicOffsetFactory(vnode.attrs.mechanic, vnode.key, 0) }
      ),
      m('label', 'Y: '),
      m(
        `input[type=number][value=${instance.offset[1]}].offset-input`,
        { oninput: handleMechanicOffsetFactory(vnode.attrs.mechanic, vnode.key, 1) }
      ),
      m('label', 'Steps: '),
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
        '.component.admechanic-params.indented',
        m('label', "Enter params (any of ['default', 'self', 'king']):"),
        m(
          `input[type=text][value="${state.componentForm.admechanics[vnode.key]}"]`,
          { oninput: handleAdmechanicParamsFactory(vnode.key) }
        )
      )
    }
    return m(
      '.component.admechanic',
      `"${vnode.key}" – `,
      m('span.italics', vnode.attrs.description),
      m(
        'input[type=checkbox]',
        {
          checked: state.componentForm.admechanics[vnode.key],
          oninput: handleToggleAdmechanicFactory(vnode.key)
        }
      ),
      form
    )
  }
}

const ComponentKing = {
  view: () => {
    return m(
      '.component.form-field',
      'King: ',
      m(
        'input[type=checkbox]',
        {
          checked: state.componentForm.king,
          oninput: handleToggleKing
        }
      )
    )
  }
}

const ComponentGraphics = {
  view: () => {
    return m(
      '.component.form-field',
      m('p', 'Graphics: '),
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
          'label',
          m(
            'input[type="radio"]',
            {
              value: piece,
              onclick: handleSaveFactory('graphics'),
              checked: state.componentForm.graphics === piece
            }
          ),
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
    return buttons
  }
}

const InitialBuyField = {
  view: () => {
    return m(
      '.component.form-field',
      'Tokens to buy: ',
      m(
        'input[type=number][placeholder=0]',
        { oninput: handleSaveInitialBuy }
      ),
      `(${state.componentForm.value} Wei)`
    )
  }
}

const CurveAddressField = {
  view: () => {
    return m(
      '.component.form-field',
      'Curve address: ',
      m(
        'input[type=number][placeholder=Leave blank!]',
        { oninput: handleSaveFactory('curveAddress') }
      )
    )
  }
}

// handlers
const handleLoadComponent = (event) => {
  event.preventDefault()
  const component = state.squad.components[event.target.value]
  const data = JSON.parse(component.data)

  const graphics = data.graphics.local.white.split('/').pop().slice(1)

  state.componentForm = Object.assign(state.componentForm, {
    name: component.name,
    mechanics: data.mechanics || {},
    admechanics: data.admechanics || {},
    king: data.king,
    graphics
  })
}

const handleClearForm = (event) => {
  event.preventDefault()
  clearForm()
}

function clearForm () {
  state.componentForm = Object.assign(
    {},
    {
      mechanics: {},
      admechanics: {},
      graphics: '',
      initialBuy: 0,
      value: 0
    }
  )
}

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
      offset: [0, 0],
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
  const whiteGraphicPath = graphicsPaths[state.componentForm.graphics].white
  const blackGraphicPath = graphicsPaths[state.componentForm.graphics].black
  const mechanics = {}
  for (const mechanic in state.componentForm.mechanics) {
    mechanics[mechanic] = []
    for (const key in state.componentForm.mechanics[mechanic]) {
      mechanics[mechanic].push(state.componentForm.mechanics[mechanic][key])
    }
  }
  const definition = {
    Component: {
      name: state.componentForm.name,
      data: JSON.stringify({
        mechanics,
        admechanics: state.componentForm.admechanics,
        king: state.componentForm.king,
        graphics: {
          local: {
            white: whiteGraphicPath,
            black: blackGraphicPath
          }
        }
      })
    }
  }

  const localDefs = JSON.parse(localStorage.getItem('localDefinitions'))
  console.log('local components', localDefs)
  localStorage.setItem('localDefinitions', JSON.stringify([...localDefs, definition]))

  console.log('Submitting definition:', definition)

  // make sure we get the right value before submitting, if not enough time has already passed
  squad.curationMarket.getBuyPriceFromCurve(0, state.componentForm.initialBuy, state.componentForm.curveAddress).then(res => {
    const value = res
    squad.definition(
      definition,
      [settings.gameAddress],
      state.componentForm.initialBuy,
      { value },
      state.componentForm.curveAddress
    )
  })
}

export default ComponentForm