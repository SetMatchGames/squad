/* global localStorage */

import m from 'mithril'
import squad from '@squad/sdk'

import state from '../state.js'
import settings from '../settings.js'
import { mechanics, admechanics } from '../rules.js'
import graphicsPaths from '../graphics-paths.json'
import { shortHash, getMarketInfo } from '../utils.js'

const PieceForm = {
  oninit: () => {
    getMarketInfo()
    clearForm()
  },
  view: () => {
    const form = m(
      'form#piece-form',
      m(Explanation),
      m(PiecePreloader),
      m(DefinitionFields),
      m(MarketFields),
      m(
        'button.submit',
        { onclick: handleSubmit },
        'Submit new definition'
      )
    )
    return m(
      '#piece-form.body',
      m('h2', 'New Piece'),
      form
    )
  }
}

const Explanation = {
  view: () => {
    return m(
      'p',
      'Create a new piece that can be added to formats.'
    )
  }
}

const PiecePreloader = {
  view: () => {
    let content = 'Loading...'
    if (state.squad.components) {
      content = m(
        '.piece.form-field',
        m('h3', 'Load an existing piece'),
        Object.keys(state.squad.components).map(key => {
          return m(PieceButton, {
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

const PieceButton = {
  view: (vnode) => {
    return m(
      'button',
      { value: vnode.key, onclick: handleLoadPiece },
      vnode.attrs.name
    )
  }
}

const DefinitionFields = {
  view: () => {
    return m(
      '.piece.definition',
      m(PieceBasicsFields),
      m(PieceMechanics),
      m(PieceGraphics)
    )
  }
}

const PieceBasicsFields = {
  view: () => {
    return m(
      '.piece.form-field',
      m('h3', 'Basics'),
      m(PieceNameField),
      m(PieceDescriptionField)
    )
  }
}

const PieceNameField = {
  view: () => {
    return m(
      '.piece',
      'Name: ',
      m(
        'input[type=text]',
        { value: state.componentForm.name, oninput: handleSaveFactory('name') }
      )
    )
  }
}

const PieceDescriptionField = {
  view: () => {
    return m(
      '.piece',
      'Description: ',
      m(
        'input[type=text]',
        { value: state.componentForm.description, oninput: handleSaveFactory('description') }
      )
    )
  }
}

const PieceMechanics = {
  view: () => {
    return m(
      '.piece.form-field',
      m('h3', 'Mechanics '),
      m('p', 'Choose the rules for your piece. Each instance is a possible action your piece can take.'),
      Object.keys(mechanics).map(mechanic => {
        return m(
          PieceMechanic,
          { key: mechanic, description: mechanics[mechanic] }
        )
      }),
      Object.keys(admechanics).map(admechanic => {
        return m(
          PieceAdmechanic,
          { key: admechanic, description: admechanics[admechanic] }
        )
      }),
      m(PieceKing)
    )
  }
}

const PieceMechanic = {
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
      '.piece.mechanic',
      `${vnode.key} – `,
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
      '.piece.mechanic-params.indented',
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

const PieceAdmechanic = {
  view: (vnode) => {
    let form
    if (state.componentForm.admechanics[vnode.key] !== undefined) {
      form = m(
        '.piece.admechanic-params.indented',
        m('label', "Enter params (any of ['default', 'self', 'king']):"),
        m(
          `input[type=text][value="${state.componentForm.admechanics[vnode.key]}"]`,
          { oninput: handleAdmechanicParamsFactory(vnode.key) }
        )
      )
    }
    return m(
      '.piece.admechanic',
      `${vnode.key} – `,
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

const PieceKing = {
  view: () => {
    return m(
      '.piece',
      'king – ',
      m('span.italics', "If a player captures all their opponent's kings, they win."),
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

const PieceGraphics = {
  view: () => {
    return m(
      '.piece.form-field',
      m('h3', 'Graphics'),
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

const MarketFields = {
  view: () => {
    return m(
      '.piece.form-field',
      m('h3', 'Tokens and Licensing'),
      m(InitialBuyField)
    )
  }
}

const InitialBuyField = {
  view: () => {
    return m(
      '.piece',
      'Tokens to buy: ',
      m(
        'input[type=number][placeholder=0]',
        { oninput: handleSaveInitialBuy }
      ),
      `Cost: ${state.componentForm.value} Wei`
    )
  }
}

// handlers
const handleLoadPiece = (event) => {
  event.preventDefault()
  const piece = state.squad.components[event.target.value]
  const data = JSON.parse(piece.data)

  const graphics = data.graphics.local.white.split('/').pop().slice(1)

  state.componentForm = Object.assign(state.componentForm, {
    name: piece.name,
    description: data.description,
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
      name: '',
      description: '',
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
  squad.curationMarket.getBuyPriceFromCurve(0, state.componentForm.initialBuy).then(res => {
    state.componentForm.value = res
    m.redraw()
  })
}

const handleSubmit = (event) => {
  event.preventDefault()
  const description = state.componentForm.description
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
        description,
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
  squad.curationMarket.getBuyPriceFromCurve(0, state.componentForm.initialBuy).then(res => {
    const value = res
    squad.definition(
      definition,
      [settings.gameAddress],
      state.componentForm.initialBuy,
      { value }
    )
  })
}

export default PieceForm
