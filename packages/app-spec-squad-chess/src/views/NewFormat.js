/* global localStorage */

import m from 'mithril'
import squad from '@squad/sdk'

import Board from '../components/Board.js'
import Option from '../components/Option.js'
import state from '../state.js'
import settings from '../settings.js'
import { stringToSquare } from '../rules.js'
import {
  shortHash,
  getMarketInfo,
  getFullFormat,
  definitionWithAlerts
} from '../utils.js'

const FormatForm = {
  oninit: () => {
    getMarketInfo()
    clearForm()
  },
  view: () => {
    const form = m(
      'form#format-form',
      m(Explanation),
      m(FormatPreloader),
      m(DefinitionFields),
      m(MarketFields),
      m(
        'button.submit',
        { onclick: handleSubmit },
        'Submit new definition'
      )
    )
    return m(
      '#format-form.body',
      m('h2', 'New Format'),
      form
    )
  }
}

const Explanation = {
  view: () => {
    return m(
      'p',
      'Create a new format and set the price players must pay to play it. {TODO}% of the payments will go to the makers of Squad Chess as a network tax.'
    )
  }
}

const FormatPreloader = {
  view: () => {
    let content = 'Loading...'
    if (state.squad.rawFormats) {
      content = m(
        '.format.form-field',
        m('h3', 'Load an existing format'),
        Object.keys(state.squad.rawFormats).map(key => {
          return m(FormatButton, {
            key,
            name: `${state.squad.rawFormats[key].name} (${shortHash(key)})`
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

const FormatButton = {
  view: (vnode) => {
    return m(
      'button',
      { value: vnode.key, onclick: handleLoadFormat },
      vnode.attrs.name
    )
  }
}

const DefinitionFields = {
  view: () => {
    return m(
      '.format.definition',
      m(FormatBasicsFields),
      m(FormatComponentsList),
      m(FormatDataFields)
    )
  }
}

const FormatBasicsFields = {
  view: () => {
    return m(
      '.format.form-field',
      m('h3', 'Basics'),
      m(FormatNameField),
      m(FormatDescriptionField)
    )
  }
}

const FormatNameField = {
  view: () => {
    return m(
      '.format',
      'Name: ',
      m(
        'input[type=text]',
        { value: state.formatForm.name, oninput: handleSaveFactory('name') }
      )
    )
  }
}

const FormatDescriptionField = {
  view: () => {
    return m(
      '.format',
      'Description: ',
      m(
        'input[type=text]',
        { value: state.formatForm.description, oninput: handleSaveFactory('description') }
      )
    )
  }
}

const FormatComponentsList = {
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
        if (state.formatForm.components.includes(address)) { checked = true }
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
      '.format.form-field',
      m('h3', 'Pieces'),
      m('.format.components', componentBoxes)
    )
  }
}

const FormatDataFields = {
  view: () => {
    return m(
      '.format.form-field',
      m('h3', 'Board'),
      m(FormatStartingPosition),
      m(FormatOrientation)
    )
  }
}

const FormatStartingPosition = {
  oninit: () => {
    console.log('on init')
    document.body.addEventListener('click', handleRenderSquareMenu)
  },
  view: () => {
    updatePosition()
    let board
    if (Object.keys(state.formatForm.startingPosition).length) {
      const format = getFullFormat(cleanDefinition().Format, null)
      board = m(Board, {
        format,
        position: format.startingPosition,
        matchStatus: 'not connected'
      })
    }
    return [
      m(StartingPositionDimensions),
      m(SquareMenu, { id: state.menus.formatFormSquare }),
      board
    ]
  },
  onremove: () => {
    console.log('on remove')
    document.body.removeEventListener('click', handleRenderSquareMenu)
  }
}

const handleRenderSquareMenu = (event) => {
  if (event.target.classList[0] === 'square') {
    const id = event.target.id
    state.menus.formatFormSquare = id
    state.board.highlightedSquares = [stringToSquare(id)]
    m.redraw()
  }
}

const StartingPositionDimensions = {
  view: () => {
    return m(
      '.format',
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
    if (state.formatForm.startingPosition[vnode.attrs.square].deleted === true) {
      return
    }

    const id = `piece${vnode.attrs.square}`
    const options = { None: 'None' }
    state.formatForm.components.forEach(address => {
      options[address] = state.squad.components[address].name
    })
    let currentSelection = 'None'
    if (state.formatForm.startingPosition[vnode.attrs.square].content) {
      currentSelection = state.formatForm.startingPosition[vnode.attrs.square].content.pieceId
    }
    const callback = (value) => {
      if (state.formatForm.startingPosition[vnode.attrs.square].content) {
        state.formatForm.startingPosition[vnode.attrs.square].content.pieceId = value
      } else {
        state.formatForm.startingPosition[vnode.attrs.square].content = { pieceId: value, player: 0 }
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
    if (state.formatForm.startingPosition[vnode.attrs.square].deleted === true) {
      return
    }
    if (!state.formatForm.startingPosition[vnode.attrs.square].content) {
      return
    }

    const id = `pieceColor${vnode.attrs.square}`
    let currentSelection = 0
    if (state.formatForm.startingPosition[vnode.attrs.square].content) {
      currentSelection = state.formatForm.startingPosition[vnode.attrs.square].content.player
    }
    const callback = (value) => {
      state.formatForm.startingPosition[vnode.attrs.square].content.player = Number(value)
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
    if (state.formatForm.startingPosition[vnode.attrs.square].deleted === true) {
      return
    }

    const id = `promotion${vnode.attrs.square}`
    const options = {
      None: 'None',
      0: 'White',
      1: 'Black'
    }
    let currentSelection = 'None'
    if (state.formatForm.startingPosition[vnode.attrs.square].promotion === 0 ||
      state.formatForm.startingPosition[vnode.attrs.square].promotion === 1) {
      currentSelection = state.formatForm.startingPosition[vnode.attrs.square].promotion
    }
    const callback = (value) => {
      state.formatForm.startingPosition[vnode.attrs.square].promotion = Number(value)
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
    if (state.formatForm.startingPosition[vnode.attrs.square].deleted) {
      currentSelection = 'true'
    }
    const callback = (value) => {
      if (value === 'true') {
        state.formatForm.startingPosition[vnode.attrs.square].deleted = true
      } else {
        state.formatForm.startingPosition[vnode.attrs.square].deleted = false
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

const FormatOrientation = {
  view: () => {
    const whiteSelection = state.formatForm.orientation.white
    const blackSelection = state.formatForm.orientation.black
    const callbackFactory = (color) => {
      return (value) => {
        state.formatForm.orientation[color] = Number(value)
      }
    }
    return m(
      '.format.orientation',
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

const MarketFields = {
  view: () => {
    return m(
      '.format.form-field',
      m('h3', 'Tokens and Licensing'),
      m(InitialBuyField)
    )
  }
}

const InitialBuyField = {
  view: () => {
    return m(
      '.format',
      'Tokens to buy: ',
      m(
        'input[type=number][placeholder=0]',
        { oninput: handleSaveInitialBuy }
      ),
      `Cost: ${state.formatForm.value} Wei`
    )
  }
}

// handlers
const handleLoadFormat = (event) => {
  event.preventDefault()
  const format = state.squad.rawFormats[event.target.value]
  const data = JSON.parse(format.data)
  state.formatForm = Object.assign(state.formatForm, {
    startingPosition: data.startingPosition,
    orientation: Object.assign(
      { white: 2, black: 0 },
      data.orientation
    ),
    name: format.name,
    description: data.description,
    components: [...format.components]
  })

  state.formatForm.loadedStartingPosition = Object.assign({}, data.startingPosition)
}

const handleClearForm = (event) => {
  event.preventDefault()
  clearForm()
}

function clearForm () {
  state.formatForm = Object.assign(
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
      initialBuy: 0,
      value: 0,
      boardSize: {}
    }
  )
}

const handleSaveFactory = (dataType) => {
  return (event) => {
    state.formatForm[dataType] = event.target.value
    console.log(state.formatForm)
  }
}

const handleAddOrRemoveComponent = (event) => {
  const address = event.target.value
  if (state.formatForm.components.includes(address)) {
    const index = state.formatForm.components.indexOf(address)
    state.formatForm.components.splice(index, 1)
  } else {
    state.formatForm.components.push(address)
  }
}

const handleSaveInitialBuy = (event) => {
  state.formatForm.initialBuy = event.target.value
  squad.curationMarket.getBuyPriceFromCurve(0, state.formatForm.initialBuy).then(res => {
    state.formatForm.value = res
    m.redraw()
  })
}

const handleSubmit = (event) => {
  event.preventDefault()
  const definition = cleanDefinition()
  const localDefs = JSON.parse(localStorage.getItem('localDefinitions'))
  localStorage.setItem('localDefinitions', JSON.stringify([...localDefs, definition]))
  console.log('Definition being submitted', definition)
  // make sure we get the right value before submitting, if not enough time has already passed
  squad.curationMarket.getBuyPriceFromCurve(0, state.formatForm.initialBuy).then(res => {
    const value = res
    definitionWithAlerts(
      definition,
      [settings.gameAddress],
      state.formatForm.initialBuy,
      { value }
    )
  })
}

// helpers

function cleanDefinition () {
  const description = state.formatForm.description
  const startingPosition = cleanStartingPosition(state.formatForm.startingPosition)
  const orientation = state.formatForm.orientation
  return {
    Format: {
      name: state.formatForm.name,
      components: state.formatForm.components,
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
  const oldSquares = Object.keys(state.formatForm.startingPosition)
  const newSquares = []
  for (let w = 0; w < state.formatForm.startingPositionWidth; w++) {
    for (let h = 0; h < state.formatForm.startingPositionHeight; h++) {
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
    delete state.formatForm.startingPosition[square]
  })
  // if we've preloaded a format, add that back in
  if (state.formatForm.loadedStartingPosition) {
    state.formatForm.startingPosition = Object.assign(
      state.formatForm.startingPosition,
      state.formatForm.loadedStartingPosition
    )
  }
  newNotShared.forEach(square => {
    // for keys only in new keys, add default values
    state.formatForm.startingPosition[square] = { content: null, deleted: false }
  })
}

export default FormatForm
