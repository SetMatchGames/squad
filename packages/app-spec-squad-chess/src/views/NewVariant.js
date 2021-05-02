/* global localStorage */

import m from 'mithril'

import Board from '../components/Board.js'
import Option from '../components/Option.js'
import state from '../state.js'
import settings from '../settings.js'
import { stringToSquare } from '../rules.js'
import {
  shortHash,
  getMarketInfo,
  getFullVariant,
  definitionWithAlerts
} from '../utils.js'

const VariantForm = {
  oninit: () => {
    getMarketInfo()
    clearForm()
  },
  view: () => {
    const form = m(
      'form#variant-form',
      m(Explanation),
      m(VariantPreloader),
      m(DefinitionFields),
      m(LicenseFields),
      m(
        'button.submit',
        { onclick: handleSubmit },
        'Submit new definition'
      )
    )
    return m(
      '#variant-form.body',
      m('h2', 'New Variant'),
      form
    )
  }
}

const Explanation = {
  view: () => {
    return m(
      'p',
      'Create a new variant and set the price players must pay to play it. {TODO}% of the payments will go to the makers of Squad Chess as a network tax.'
    )
  }
}

const VariantPreloader = {
  view: () => {
    let content = 'Loading...'
    if (state.squad.rawVariants) {
      console.log('variants atm', state.squad.rawVariants)
      content = m(
        '.variant.form-field',
        m('h3', 'Load an existing variant'),
        Object.keys(state.squad.rawVariants).map(key => {
          return m(VariantButton, {
            key,
            name: `${state.squad.rawVariants[key].name} (${shortHash(key)})`
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

const VariantButton = {
  view: (vnode) => {
    return m(
      'button',
      { value: vnode.key, onclick: handleLoadVariant },
      vnode.attrs.name
    )
  }
}

const DefinitionFields = {
  view: () => {
    return m(
      '.variant.definition',
      m(VariantBasicsFields),
      m(VariantComponentsList),
      m(VariantDataFields)
    )
  }
}

const VariantBasicsFields = {
  view: () => {
    return m(
      '.variant.form-field',
      m('h3', 'Basics'),
      m(VariantNameField),
      m(VariantDescriptionField)
    )
  }
}

const VariantNameField = {
  view: () => {
    return m(
      '.variant',
      'Name: ',
      m(
        'input[type=text]',
        { value: state.variantForm.name, oninput: handleSaveFactory('name') }
      )
    )
  }
}

const VariantDescriptionField = {
  view: () => {
    return m(
      '.variant',
      'Description: ',
      m(
        'input[type=text]',
        { value: state.variantForm.description, oninput: handleSaveFactory('description') }
      )
    )
  }
}

const VariantComponentsList = {
  view: () => {
    let componentBoxes = 'Loading...'
    if (state.squad.components) {
      componentBoxes = []
      for (const address in state.squad.components) {
        const name = `${state.squad.components[address].name} (${shortHash(address)})`
        let description = JSON.parse(state.squad.components[address].data).description
        if (description) {
          description = ' – ' + description
        } else {
          description = ''
        }
        let checked = false
        if (state.variantForm.components.includes(address)) { checked = true }
        componentBoxes = componentBoxes.concat([
          m(
            `label[for=${name}]`,
            m(
              `input[type=checkbox][name=${name}][value=${address}]`,
              { oninput: handleAddOrRemoveComponent, checked }
            ),
            name,
            m('span.italics', description)
          )
        ])
      }
    }
    return m(
      '.variant.form-field',
      m('h3', 'Pieces'),
      m('.variant.components', componentBoxes)
    )
  }
}

const VariantDataFields = {
  view: () => {
    return m(
      '.variant.form-field',
      m('h3', 'Board'),
      m(VariantStartingPosition),
      m(VariantOrientation)
    )
  }
}

const VariantStartingPosition = {
  oninit: () => {
    document.body.addEventListener('click', handleRenderSquareMenu)
  },
  view: () => {
    updatePosition()
    let board
    if (Object.keys(state.variantForm.startingPosition).length) {
      const variant = getFullVariant(cleanDefinition({ deletedSquares: true }).Variant, null)
      board = m(Board, {
        variant,
        position: variant.startingPosition,
        matchStatus: 'not connected'
      })
    }
    return [
      m(StartingPositionDimensions),
      m(SquareMenu, { id: state.menus.variantFormSquare }),
      board
    ]
  },
  onremove: () => {
    document.body.removeEventListener('click', handleRenderSquareMenu)
  }
}

const handleRenderSquareMenu = (event) => {
  if (event.target.classList[0] === 'square') {
    const id = event.target.id
    state.menus.variantFormSquare = id
    state.board.highlightedSquares = [stringToSquare(id)]
    m.redraw()
  }
}

const StartingPositionDimensions = {
  view: () => {
    return m(
      '.variant',
      m(
        'p',
        'Width: ',
        m(
          'input[type=number]',
          { oninput: handleSaveFactory('startingPositionWidth') }
        )
      ),
      m(
        'p',
        'Height: ',
        m(
          'input[type=number]',
          { oninput: handleSaveFactory('startingPositionHeight') }
        )
      )
    )
  }
}

const SquareMenu = {
  view: (vnode) => {
    if (!vnode.attrs.id) { return }
    return m(
      `.square-menu#${vnode.attrs.id}`,
      m(PieceOption, { square: vnode.attrs.id }),
      m(PieceColorOption, { square: vnode.attrs.id }),
      m(PromotionOption, { square: vnode.attrs.id }),
      m(DeleteOption, { square: vnode.attrs.id })
    )
  }
}

const PieceOption = {
  view: (vnode) => {
    if (state.variantForm.startingPosition[vnode.attrs.square].deleted === true) {
      return
    }

    const id = `piece${vnode.attrs.square}`
    const options = { None: 'None' }
    state.variantForm.components.forEach(address => {
      options[address] = state.squad.components[address].name
    })
    let currentSelection = 'None'
    if (state.variantForm.startingPosition[vnode.attrs.square].content) {
      currentSelection = state.variantForm.startingPosition[vnode.attrs.square].content.pieceId
    }
    const callback = (value) => {
      if (state.variantForm.startingPosition[vnode.attrs.square].content) {
        if (value === 'None') {
          state.variantForm.startingPosition[vnode.attrs.square].content = null
        } else {
          state.variantForm.startingPosition[vnode.attrs.square].content.pieceId = value
        }
      } else {
        state.variantForm.startingPosition[vnode.attrs.square].content = { pieceId: value, player: 0 }
      }
    }

    return m(
      'label',
      'Piece: ',
      m(Option, {
        id,
        options,
        currentSelection,
        callback
      })
    )
  }
}

const PieceColorOption = {
  view: (vnode) => {
    if (state.variantForm.startingPosition[vnode.attrs.square].deleted === true) {
      return
    }
    if (!state.variantForm.startingPosition[vnode.attrs.square].content) {
      return
    }

    const id = `pieceColor${vnode.attrs.square}`
    let currentSelection = 0
    if (state.variantForm.startingPosition[vnode.attrs.square].content) {
      currentSelection = state.variantForm.startingPosition[vnode.attrs.square].content.player
    }
    const callback = (value) => {
      state.variantForm.startingPosition[vnode.attrs.square].content.player = Number(value)
    }

    return m(
      'label',
      'Piece Color: ',
      m(Option, {
        id,
        options: {
          0: 'White',
          1: 'Black'
        },
        currentSelection,
        callback
      })
    )
  }
}

const PromotionOption = {
  view: (vnode) => {
    if (state.variantForm.startingPosition[vnode.attrs.square].deleted === true) {
      return
    }

    const id = `promotion${vnode.attrs.square}`
    const options = {
      None: 'None',
      0: 'White',
      1: 'Black'
    }
    let currentSelection = 'None'
    if (state.variantForm.startingPosition[vnode.attrs.square].promotion === 0 ||
      state.variantForm.startingPosition[vnode.attrs.square].promotion === 1) {
      currentSelection = state.variantForm.startingPosition[vnode.attrs.square].promotion
    }
    const callback = (value) => {
      state.variantForm.startingPosition[vnode.attrs.square].promotion = Number(value)
    }

    return m(
      'label',
      'Promotion: ',
      m(Option, {
        id,
        options,
        currentSelection,
        callback
      })
    )
  }
}

const DeleteOption = {
  view: (vnode) => {
    const id = `delete${vnode.attrs.square}`
    const options = {
      false: 'No',
      true: 'Yes'
    }
    let currentSelection = 'false'
    if (state.variantForm.startingPosition[vnode.attrs.square].deleted) {
      currentSelection = 'true'
    }
    const callback = (value) => {
      if (value === 'true') {
        state.variantForm.startingPosition[vnode.attrs.square].deleted = true
      } else {
        state.variantForm.startingPosition[vnode.attrs.square].deleted = false
      }
    }

    return m(
      'label',
      'Deleted?',
      m(Option, {
        id,
        options,
        currentSelection,
        callback
      })
    )
  }
}

const VariantOrientation = {
  view: () => {
    const whiteSelection = state.variantForm.orientation.white
    const blackSelection = state.variantForm.orientation.black
    const callbackFactory = (color) => {
      return (value) => {
        state.variantForm.orientation[color] = Number(value)
      }
    }
    return m(
      '.variant.orientation',
      m(
        'p',
        m('label', 'Direction for white pieces: '),
        m(Option, {
          id: 'whiteOrientation',
          options: {
            0: 'Top to bottom',
            2: 'Bottom to top',
            3: 'Right to left',
            1: 'Left to right'
          },
          currentSelection: whiteSelection,
          callback: callbackFactory('white')
        })
      ),
      m(
        'p',
        m('label', 'Direction for black pieces: '),
        m(Option, {
          id: 'blackOrientation',
          options: {
            0: 'Top to bottom',
            2: 'Bottom to top',
            3: 'Right to left',
            1: 'Left to right'
          },
          currentSelection: blackSelection,
          callback: callbackFactory('black')
        })
      )
    )
  }
}

const LicenseFields = {
  view: () => {
    return m(
      '.variant.form-field',
      m('h3', 'License Settings'),
      m('p', 'Choose the price and the percentage fee you will receive on all purchases of this contribution.'),
      m(PurchasePriceField),
      // m(BeneficiaryField),
      m(FeeField)
    )
  }
}

const PurchasePriceField = {
  view: () => {
    return m(
      '.variant',
      'Purchase price (XEENUS): ',
      m(
        'input[type=number]',
        {
          value: state.variantForm.purchasePrice,
          oninput: handleSaveFactory('purchasePrice')
        }
      )
    )
  }
}

/*
const BeneficiaryField = {
  view: () => {
    return m(
      '.variant',
      'Beneficiary address: ',
      m(
        `input[type=text][value=${state.address}]`,
        { oninput: handleSaveFactory('beneficiary') }
      )
    )
  }
}
*/

const FeeField = {
  view: () => {
    return m(
      '.variant',
      'Beneficiary fee: ',
      m(
        'input[type=number]',
        {
          value: state.variantForm.beneficiaryFee,
          oninput: handleSaveFactory('beneficiaryFee')
        }
      ),
      '%'
    )
  }
}

/*
const InitialBuyField = {
  view: () => {
    return m(
      '.variant',
      'Tokens to buy: ',
      m(
        'input[type=number][placeholder=0]',
        { oninput: handleSaveInitialBuy }
      ),
      `Cost: ${state.componentForm.value} Wei`
    )
  }
}
*/

// handlers
const handleLoadVariant = (event) => {
  event.preventDefault()
  const variant = state.squad.rawVariants[event.target.value]
  const data = JSON.parse(variant.data)
  state.variantForm = Object.assign(state.variantForm, {
    startingPosition: data.startingPosition,
    orientation: Object.assign(
      { white: 2, black: 0 },
      data.orientation
    ),
    name: variant.name,
    description: data.description,
    components: [...variant.components]
  })

  state.variantForm.loadedStartingPosition = Object.assign({}, data.startingPosition)
}

const handleClearForm = (event) => {
  event.preventDefault()
  clearForm()
}

function clearForm () {
  state.variantForm = Object.assign(
    {},
    {
      name: '',
      description: '',
      components: [],
      startingPosition: {},
      orientation: {
        white: 2,
        black: 0
      },
      purchasePrice: '',
      beneficiaryFee: '',
      initialBuy: 0,
      value: 0,
      boardSize: {}
    }
  )
  state.menus.variantFormSquare = ''
}

const handleSaveFactory = (dataType) => {
  return (event) => {
    state.variantForm[dataType] = event.target.value
    console.log(state.variantForm)
  }
}

const handleAddOrRemoveComponent = (event) => {
  const address = event.target.value
  if (state.variantForm.components.includes(address)) {
    const index = state.variantForm.components.indexOf(address)
    state.variantForm.components.splice(index, 1)
  } else {
    state.variantForm.components.push(address)
  }
}
/*
const handleSaveInitialBuy = (event) => {
  state.variantForm.initialBuy = event.target.value
  squad.curationMarket.getBuyPriceFromCurve(0, state.variantForm.initialBuy).then(res => {
    state.variantForm.value = res
    m.redraw()
  })
}
*/
const handleSubmit = (event) => {
  event.preventDefault()
  const definition = cleanDefinition({ deletedSquares: false })
  const localDefs = JSON.parse(localStorage.getItem('localDefinitions'))
  localStorage.setItem('localDefinitions', JSON.stringify([...localDefs, definition]))
  // convert  percent to basis points
  const feeRate = parseInt(state.variantForm.beneficiaryFee * 100)
  console.log(
    'Definition being submitted',
    definition,
    state.variantForm
  )
  // make sure we get the right value before submitting, if not enough time has already passed
  definitionWithAlerts(
    definition,
    [settings.gameAddress],
    feeRate,
    parseInt(state.variantForm.purchasePrice)
  )
}

// helpers

function cleanDefinition ({ deletedSquares }) {
  const description = state.variantForm.description
  let startingPosition = state.variantForm.startingPosition
  if (!deletedSquares) {
    startingPosition = cleanStartingPosition(startingPosition)
  }

  const orientation = state.variantForm.orientation
  return {
    Variant: {
      name: state.variantForm.name,
      components: state.variantForm.components,
      data: JSON.stringify({
        description,
        startingPosition,
        orientation
      })
    }
  }
}

function cleanStartingPosition (sp) {
  const cleanPosition = {}
  for (const square in sp) {
    if (sp[square].deleted === false || sp[square].deleted === undefined) {
      cleanPosition[square] = Object.assign({}, sp[square])
      delete cleanPosition[square].deleted
    }
  }
  return cleanPosition
}

function updatePosition () {
  const oldSquares = Object.keys(state.variantForm.startingPosition)
  const newSquares = []
  for (let w = 0; w < state.variantForm.startingPositionWidth; w++) {
    for (let h = 0; h < state.variantForm.startingPositionHeight; h++) {
      const square = `${w},${h}`
      newSquares.push(square)
    }
  }
  const oldNotShared = [...oldSquares]
  const newNotShared = [...newSquares]
  newSquares.forEach(square => {
    if (oldSquares.includes(square)) {
      oldNotShared.splice(oldNotShared.indexOf(square), 1)
      newNotShared.splice(newNotShared.indexOf(square), 1)
    }
  })
  oldNotShared.forEach(square => {
    // for keys only in old keys, delete the key and value
    delete state.variantForm.startingPosition[square]
  })
  // if we've preloaded a variant, add that back in
  if (state.variantForm.loadedStartingPosition) {
    state.variantForm.startingPosition = Object.assign(
      state.variantForm.startingPosition,
      state.variantForm.loadedStartingPosition
    )
  }
  newNotShared.forEach(square => {
    // for keys only in new keys, add default values
    state.variantForm.startingPosition[square] = { content: null, deleted: false }
  })
}

export default VariantForm
