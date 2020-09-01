import m from 'mithril'
import { matchmaking } from '@squad/sdk'

import chess from '../rules.js'
import state from '../state.js'
import settings from '../settings.js'
import { checkWinner } from '../utils.js'

const BOARD_CONFIG = settings.boardConfig

const Board = {
  oninit: resetBoardState,
  view: () => {
    switch (state.matchmaking.connection) {
      case 'match started':
        state.board.matchStatus = 'Match started!'
        break
      default:
        state.board.matchStatus = 'Match not started.'
    }
    if (!state.game.position) {
      return m('div', 'Load a format!')
    } else {
      const xRange = state.squad.loadedFormat.boardSize.x.range + 1
      const yRange = state.squad.loadedFormat.boardSize.y.range + 1
      let max = xRange
      if (xRange < yRange) { max = yRange }
      const width = 100 * xRange / max + '%'
      const height = 100 * yRange / max + '%'
      const playarea = m(
        '#play-area',
        {
          style: {
            width,
            height
          }
        },
        // For each square in the position
        Object.keys(state.game.position).map(squareId => {
          // grab what's in the square
          const content = state.game.position[squareId].content
          // if there is a piece, grab links to piece images
          let graphics
          if (content) {
            graphics = state.squad.loadedFormat.pieces[content.pieceId].graphics
          }
          // add the square to the board
          return m(
            BoardSquare,
            { key: squareId, content, graphics }
          )
        })
      )
      return m(
        '#board.body',
        m('p#match-status', `${state.board.matchStatus} ${state.board.winner}`),
        playarea
      )
    }
  }
}

// initialize or reset the 'board' part of the state
function resetBoardState () {
  document.addEventListener('dragover', (e) => {
    e.preventDefault()
  }, false)

  // set initial game state
  if (!state.squad.loadedFormat) {
    m.route.set('/formats')
    console.log('Load a format before playing. Current format:', state.squad.loadedFormat)
    // TODO Notification asking them to load a format
  } else if (state.matchmaking.connection !== 'match started') {
    m.route.set('/matchmaking/:formatAddress', { formatAddress })
  }
  // TODO reject if no match has started?
  state.game = chess.createGame(state.squad.loadedFormat)

  // set match state
  state.board = {
    from: [],
    highlightedSquares: [],
    deselectable: [],
    matchStatus: 'not started',
    winner: ''
  }
}

function queueDeselect () {
  return (e) => {
    state.board = Object.assign({}, state.board, {
      deselectable: chess.stringToSquare(e.target.id)
    })
  }
}

function handleDeselectPiece () {
  return resetBoardState
}

function handleSelectPiece () {
  return (e) => {
    // select the piece and highlight possible turns
    const from = chess.stringToSquare(e.target.id)
    const tos = []
    Object.keys(state.game.legalTurns[from]).forEach(toSquare => {
      tos.push(chess.stringToSquare(toSquare))
    })
    state.board = Object.assign({}, state.board, {
      from,
      highlightedSquares: tos
    })
  }
}

const BoardSquare = {
  view: (vnode) => {
    // convert the string coordinates back to an array
    const coordinates = chess.stringToSquare(vnode.key)
    // highlight square
    const highlighted = squareInArray(coordinates, state.board.highlightedSquares)
    let squareContent
    let onclick
    // if the square holds a piece, set the properties
    if (vnode.attrs.content) {
      // get the link to the piece graphic
      let imgLink
      let pieceColor = 'white'
      if (vnode.attrs.content.player === 1) { pieceColor = 'black' }
      // prioritize local images
      if (vnode.attrs.graphics.local) {
        imgLink = `./img/${vnode.attrs.graphics.local[pieceColor]}`
      } // else if (vnode.graphics.remote)...
      squareContent = m(BoardPiece, { imgLink, key: vnode.key })
    } else {
      // if the square is empty and highlighted, add an onclick for handling a turn
      if (highlighted) { onclick = handleTurn() }
    }
    // if not, just return an empty square
    return m(
      `.square#${vnode.key}`,
      {
        style: squareStyle(coordinates, highlighted),
        ondrop: handleTurn(),
        onclick
      },
      squareContent
    )
  }
}

function squareStyle (coordinates, highlighted) {
  // get rid of extra space
  coordinates = [
    coordinates[0] - state.squad.loadedFormat.boardSize.x.min,
    coordinates[1] - state.squad.loadedFormat.boardSize.y.min
  ]

  // create the checkerboard color pattern
  let squareColor = BOARD_CONFIG.squares.lightColor
  if ((coordinates[0] + coordinates[1]) % 2 === 1) { squareColor = BOARD_CONFIG.squares.darkColor }

  // spacing and size
  const xRange = state.squad.loadedFormat.boardSize.x.range + 1
  const yRange = state.squad.loadedFormat.boardSize.y.range + 1
  const result = {
    right: 100 * coordinates[0] / xRange + '%',
    top: 100 * coordinates[1] / yRange + '%',
    width: 100 / xRange + '%',
    height: 100 / yRange + '%',
    background: squareColor
  }

  if (highlighted === true) {
    // highlighted square styling
    result['box-shadow'] = 'inset 0px 0px 0px 3px yellow'
  }
  return result
}

const BoardPiece = {
  view: (vnode) => {
    const attrs = {
      src: vnode.attrs.imgLink,
      style: {
        width: '92%',
        height: '92%'
      }
    }
    const coordinates = chess.stringToSquare(vnode.key)
    const highlighted = squareInArray(coordinates, state.board.highlightedSquares)
    const player = state.game.position[vnode.key].content.player
    // if a match hasn't started, don't add events
    if (state.matchmaking.connection !== 'match started') {
      /* do nothing */
    // if it isn't our turn and its not highlighted, don't add events
    } else if ((player !== state.matchmaking.player) && !highlighted) {
    // if highlighted, click to attempt turn
    } else if (highlighted) {
      attrs.onclick = handleTurn()
    // if deselect is queued, handle it
    } else if (squareInArray(coordinates, [state.board.deselectable])) {
      attrs.onmouseup = handleDeselectPiece()
    // if the selected piece, let another mousedown queue deselect
    } else if (squareInArray(coordinates, [state.board.from])) {
      attrs.onmousedown = queueDeselect()
    // if not highlighted or selected, select the piece
    } else if (player === state.game.turnNumber % 2) {
      attrs.onmousedown = handleSelectPiece()
    }
    return m('img#' + vnode.key, attrs)
  }
}

function handleTurn () {
  return (e) => {
    e.preventDefault()
    const from = state.board.from
    const to = e.target.id
    // attempt to take the turn
    const newState = chess.takeTurn(state.game, [from, to])
    // update the state if takeTurn doesn't throw
    state.game = newState
    sendMessage(state.game)
    state.board.highlightedSquares = []
    // if no legal turns, the game is over
    checkWinner()
  }
}

function sendMessage (message) {
  if (!state.matchmaking.messageNumber) {
    state.matchmaking.messageNumber = 0
  }
  if (!message.number) {
    state.matchmaking.messageNumber += 1
    message.number = state.matchmaking.messageNumber
  }
  if (message.number < state.matchmaking.messageNumber) {
    return
  }
  console.log('Sending message:', message)
  matchmaking.sendMessage(message)
  setTimeout(() => {
    console.log('resending message number', message.number)
    sendMessage(message)
  }, 3000)
}

function squareInArray (square, array) {
  let result = false
  if (array.length === 0) { return result }
  array.forEach(s => {
    if (s[0] === square[0] && s[1] === square[1]) {
      result = true
    }
  })
  return result
}

export default Board