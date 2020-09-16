/* global localStorage */

import m from 'mithril'
import squad from '@squad/sdk'

import state from '../state.js'
import settings from '../settings.js'
import { stringToSquare } from '../rules.js'
import { shortHash, findBoardRange, getMarketInfo, definitionWithAlerts } from '../utils.js'

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
      'Create a new format and set the price players must pay to play it. \
      {TODO}% of the payments will go to the makers of Squad Chess as a network tax.'
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
      '.format.defition',
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
  view: () => {
    return [
      m(StartingPositionDimensions),
      m(StartingPositionSquares)
    ]
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

const StartingPositionSquares = {
  view: () => {
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
    // Order squares properly
    const squares = Object.keys(state.formatForm.startingPosition).sort((a, b) => {
      a = stringToSquare(a)
      b = stringToSquare(b)
      if (a[1] !== b[1]) { return a[1] - b[1] }
      return a[0] - b[0]
    })

    // if no board is being rendered, return nothing
    if (squares.length === 0) { return }

    // Get the right sizing
    state.formatForm.boardSize.x = findBoardRange(0, state.formatForm.startingPosition)
    state.formatForm.boardSize.y = findBoardRange(1, state.formatForm.startingPosition)

    return m(
      '.format.position',
      {
        style: {
          width: (state.formatForm.boardSize.x.range + 1) * squareSize + 'px',
          height: (state.formatForm.boardSize.y.range + 1) * squareSize + 'px'
        }
      },
      squares.map(square => {
        return m(StartingPositionSquare, { key: square })
      })
    )
  }
}

const squareSize = 150

function squareStyle (coordinates, deleted) {
  // get rid of extra space
  coordinates = [
    coordinates[0] - state.formatForm.boardSize.x.min,
    coordinates[1] - state.formatForm.boardSize.y.min
  ]

  let squareColor = settings.boardConfig.squares.lightColor
  if ((coordinates[0] + coordinates[1]) % 2 === 1) { squareColor = settings.boardConfig.squares.darkColor }
  if (deleted) { squareColor = 'white' }

  return {
    right: (squareSize * coordinates[0]) + 'px',
    top: (squareSize * coordinates[1]) + 'px',
    width: squareSize + 'px',
    height: squareSize + 'px',
    background: squareColor
  }
}

const StartingPositionSquare = {
  view: (vnode) => {
    return m(
      '.format.square',
      {
        key: vnode.key,
        style: squareStyle(stringToSquare(vnode.key), state.formatForm.startingPosition[vnode.key].deleted)
      },
      m(SelectPiece, { square: vnode.key }),
      m(Promotion, { square: vnode.key }),
      m(DeleteSquareSelect, { square: vnode.key })
    )
  }
}

const SelectPiece = {
  view: (vnode) => {
    if (state.formatForm.startingPosition[vnode.attrs.square].deleted === true) {
      return
    }
    let selected = ''
    let selection
    if (state.formatForm.startingPosition[vnode.attrs.square].content) {
      selection = state.formatForm.startingPosition[vnode.attrs.square].content.pieceId
    }
    const components = [...state.formatForm.components]
    // if the selected piece is no longer in the selected piece list, still include it
    if (selection && !components.includes(selection)) {
      components.push(selection)
    }
    const options = components.map(address => {
      if (selection === address) {
        selected = 'selected'
      } else {
        selected = ''
      }
      return m(
        `option[value=${address}][${selected}]`,
        state.squad.components[address].name
      )
    })
    options.unshift(m(
      'option[value=null]',
      'None'
    ))
    const contentBool = !!state.formatForm.startingPosition[vnode.attrs.square].content
    let imgLink
    if (contentBool) {
      const pieceId = state.formatForm.startingPosition[vnode.attrs.square].content.pieceId
      const graphics = JSON.parse(state.squad.components[pieceId].data).graphics
      const player = state.formatForm.startingPosition[vnode.attrs.square].content.player
      let pieceColor = 'white'
      if (player === 1) { pieceColor = 'black' }
      // prioritize local images
      if (graphics.local) {
        imgLink = `./img/${graphics.local[pieceColor]}`
      } // else if (graphics.remote)...
    }
    return [
      m(PieceImage, { imgLink, contentBool }),
      m(
        'label',
        'Piece:',
        m(
          'select',
          { oninput: handleSelectPieceFactory(vnode.attrs.square) },
          options
        )
      ),
      m(SelectPieceColor, { contentBool, square: vnode.attrs.square })
    ]
  }
}

const PieceImage = {
  view: (vnode) => {
    if (!vnode.attrs.contentBool) { return }
    const attrs = {
      src: vnode.attrs.imgLink,
      style: {
        width: '80px',
        height: '80px'
      }
    }
    return m('img', attrs)
  }
}

const SelectPieceColor = {
  view: (vnode) => {
    if (!vnode.attrs.contentBool) { return }
    if (!state.formatForm.startingPosition[vnode.attrs.square].content.player) {
      state.formatForm.startingPosition[vnode.attrs.square].content.player = 0
    }
    let whiteSelected = 'selected'
    let blackSelected = ''
    if (state.formatForm.startingPosition[vnode.attrs.square].content.player === 1) {
      whiteSelected = ''
      blackSelected = 'selected'
    }
    return [
      m(
        'label',
        'Color:',
        m(
          'select',
          { oninput: handlePieceColorFactory(vnode.attrs.square) },
          [
            m(
              `option[value=White][${whiteSelected}]`,
              'White'
            ),
            m(
              `option[value=Black][${blackSelected}]`,
              'Black'
            )
          ]
        )
      )
    ]
  }
}

const Promotion = {
  view: (vnode) => {
    if (state.formatForm.startingPosition[vnode.attrs.square].deleted === true) {
      return
    }
    let noneSelected = 'selected'
    let whiteSelected = ''
    let blackSelected = ''
    switch (state.formatForm.startingPosition[vnode.attrs.square].promotion) {
      case 0:
        whiteSelected = 'selected'
        noneSelected = ''
        break
      case 1:
        blackSelected = 'selected'
        noneSelected = ''
        break
      default:
    }
    return [
      m(
        'label',
        'Promotion?',
        m(
          'select',
          { oninput: handlePiecePromotionFactory(vnode.attrs.square) },
          [
            m(
              `option[value=None][${noneSelected}]`,
              'None'
            ),
            m(
              `option[value=White][${whiteSelected}]`,
              'White'
            ),
            m(
              `option[value=Black][${blackSelected}]`,
              'Black'
            )
          ]
        )
      )
    ]
  }
}

const DeleteSquareSelect = {
  view: (vnode) => {
    return [
      m(
        'label',
        'Delete?',
        m(
          'select',
          { oninput: handleDeleteSquareFactory(vnode.attrs.square) },
          [
            m(
              'option[value=false]',
              'No'
            ),
            m(
              'option[value=true]',
              'Yes'
            )
          ]
        )
      )
    ]
  }
}

const FormatOrientation = {
  view: () => {
    return m(
      '.format.orientation',
      m(
        'p',
        m('label', 'Direction for white pieces: '),
        m(OrientationSelector, { player: 'whiteOrientation' })
      ),
      m(
        'p',
        m('label', 'Direction for black pieces: '),
        m(OrientationSelector, { player: 'blackOrientation' })
      )
    )
  }
}

const OrientationSelector = {
  view: (vnode) => {
    const options = {
      0: 'Top to bottom',
      2: 'Bottom to top',
      3: 'Right to left',
      1: 'Left to right'
    }
    const currentSelection = options[Number(state.formatForm[vnode.attrs.player])]
    delete options[state.formatForm[vnode.attrs.player]]
    return m(
      `.select.${state.menus[vnode.attrs.player]}`,
      m(
        'a.selected', 
        { onclick: handleToggleOrientationOptions(vnode.attrs.player) }, 
        currentSelection
      ),
      m(OrientationOptions, { options, player: vnode.attrs.player })
    )
  }
}

const OrientationOptions = {
  view: (vnode) => {
    let display = 'none'
    if (state.menus[vnode.attrs.player] === 'visible') { display = 'flex' }
    return m(
      '.options',
      Object.keys(vnode.attrs.options).map(key => {
        return m(
          `a.option#${key}`,
          { 
            onclick: handleSaveOrientation(vnode.attrs.player),
            style: { display }
          },
          vnode.attrs.options[key]
        )
      })
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
    whiteOrientation: data.orientation.white,
    blackOrientation: data.orientation.black,
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
      whiteOrientation: 2,
      blackOrientation: 0,
      orientationOptions: {},
      initialBuy: 0,
      value: 0,
      boardSize: {}
    }
  )
}

const handleSaveFactory = (dataType) => {
  return (event) => {
    state.formatForm[dataType] = event.target.value
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

const handleDeleteSquareFactory = (squareId) => {
  return (event) => {
    let bool = false
    if (event.target.value === 'true') { bool = true }
    state.formatForm.startingPosition[squareId].deleted = bool
  }
}

const handleSelectPieceFactory = (squareId) => {
  return (event) => {
    const pieceId = event.target.value
    if (pieceId === 'null') {
      state.formatForm.startingPosition[squareId].content = null
    } else {
      state.formatForm.startingPosition[squareId].content = {}
      state.formatForm.startingPosition[squareId].content.pieceId = pieceId
    }
  }
}

const handlePieceColorFactory = (squareId) => {
  return (event) => {
    const color = event.target.value
    if (color === 'White') {
      state.formatForm.startingPosition[squareId].content.player = 0
    } else if (color === 'Black') {
      state.formatForm.startingPosition[squareId].content.player = 1
    }
  }
}

const handlePiecePromotionFactory = (squareId) => {
  return (event) => {
    const promotion = event.target.value
    if (promotion === 'White') {
      state.formatForm.startingPosition[squareId].promotion = 0
    } else if (promotion === 'Black') {
      state.formatForm.startingPosition[squareId].promotion = 1
    }
  }
}


const handleSaveOrientation = (player) => {
  return (event) => {
    state.formatForm[player] = event.target.id
    toggleOrientationsOptions(player)
  }
}

const handleToggleOrientationOptions = (player) => {
  return () => {
    toggleOrientationsOptions(player)
  }
}

function toggleOrientationsOptions(player) {
  if (state.menus[player] !== 'visible') {
    state.menus[player] = 'visible'
  } else {
    state.menus[player] = 'hidden'
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
  const description = state.formatForm.description
  const startingPosition = cleanStartingPosition(state.formatForm.startingPosition)
  const orientation = {}
  orientation.white = state.formatForm.whiteOrientation
  orientation.black = state.formatForm.blackOrientation
  const definition = {
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

export default FormatForm
