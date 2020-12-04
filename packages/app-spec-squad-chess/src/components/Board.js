import m from 'mithril'
import { matchmaking } from '@squad/sdk'

import chess from '../rules.js'
import state from '../state.js'
import settings from '../settings.js'
import { checkWinner } from '../utils.js'

const BOARD_CONFIG = settings.boardConfig

const Board = {
  oninit: (vnode) => {
    resetBoardState(vnode)
  },
  view: (vnode) => {
    let position = state.game.position
    if (vnode.attrs.position) { position = vnode.attrs.position }

    const xRange = vnode.attrs.format.boardSize.x.range + 1
    const yRange = vnode.attrs.format.boardSize.y.range + 1
    let max = xRange
    if (xRange < yRange) { max = yRange }
    const width = 100 * xRange / max + '%'
    const height = 100 * yRange / max + '%'
    console.log('highlighted squares', state.board.highlightedSquares)
    console.log('current state', state.game)
    const board = m(
      '.board-squares',
      {
        style: {
          width,
          height
        }
      },
      // For each square in the position
      Object.keys(position).map(squareId => {
        // grab what's in the square
        const content = position[squareId].content
        // if there is a piece, grab links to piece images
        let graphics
        if (content) {
          // console.log(vnode.attrs.format.pieces, content, squareId)
          graphics = vnode.attrs.format.pieces[content.pieceId].graphics
        }
        // if the square has been deleted
        const deleted = position[squareId].deleted
        // add the square to the board
        return m(
          BoardSquare,
          {
            key: squareId,
            content,
            graphics,
            format: vnode.attrs.format,
            position: position,
            deleted
          }
        )
      })
    )
    return m(
      '.board',
      board
    )
  }
}

// initialize or reset the 'board' part of the state
function resetBoardState (vnode) {
  document.addEventListener('dragover', (e) => {
    e.preventDefault()
  }, false)

  // set initial game state
  try {
    state.game = chess.createGame(vnode.attrs.format)
  } catch (e) {
    console.error(e)
  }

  // set board state
  state.board = Object.assign(
    state.board,
    {
      from: [],
      highlightedSquares: [],
      deselectable: [],
      matchStatus: vnode.attrs.matchStatus
    }
  )
}

function queueDeselect () {
  return (e) => {
    state.board = Object.assign({}, state.board, {
      deselectable: chess.stringToSquare(e.target.id)
    })
  }
}

function handleDeselectPiece () {
  return () => {
    state.board = Object.assign({}, state.board, {
      deselectable: [],
      highlightedSquares: [],
      from: []
    })
  }
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
    console.log('checking last move', state.game)
    const lastMove = squareInArray(coordinates, state.game.lastTurn)
    let squareContent
    let onclick
    let piece = false
    // if the square holds a piece, set the properties
    if (vnode.attrs.content && !vnode.attrs.deleted) {
      piece = true
      // get the link to the piece graphic
      let imgLink
      let pieceColor = 'white'
      if (vnode.attrs.content.player === 1) {
        pieceColor = 'black'
      }
      // prioritize local images
      if (vnode.attrs.graphics.local) {
        imgLink = `./img/${vnode.attrs.graphics.local[pieceColor]}`
      } // else if (vnode.graphics.remote)...
      squareContent = m(BoardPiece, {
        imgLink,
        key: vnode.key,
        position: vnode.attrs.position
      })
    } else {
      // if the square is empty and highlighted, add an onclick for handling a turn
      if (highlighted) { onclick = handleTurn() }
    }
    // if not, just return an empty square
    return m(
      `.square#${vnode.key}`,
      {
        style: squareStyle(coordinates, highlighted, lastMove, piece, vnode.attrs.format, vnode.attrs.deleted),
        ondrop: handleTurn(),
        onclick
      },
      squareContent
    )
  }
}

function squareStyle (coordinates, highlighted, lastMove, piece, format, deleted) {
  // get rid of extra space
  coordinates = [
    coordinates[0] - format.boardSize.x.min,
    coordinates[1] - format.boardSize.y.min
  ]

  // create the checkerboard color pattern
  let squareColor = BOARD_CONFIG.squares.lightColor
  if ((coordinates[0] + coordinates[1]) % 2 === 1) { squareColor = BOARD_CONFIG.squares.darkColor }
  if (deleted) { squareColor = '' }

  // spacing and size
  const xRange = format.boardSize.x.range + 1
  const yRange = format.boardSize.y.range + 1
  const result = {
    right: 100 * coordinates[0] / xRange + '%',
    top: 100 * coordinates[1] / yRange + '%',
    width: 100 / xRange + '%',
    height: 100 / yRange + '%',
    background: squareColor
  }

  if (highlighted === true) {
    // highlighted square styling
    if (piece) {
      result['background'] = `radial-gradient(${squareColor} 0%, ${squareColor} 80%,  rgb(118,133,40) 80%)`
    } else {
      result['background'] = `radial-gradient(rgb(118,133,40) 19%, ${squareColor} 20%)`
    }
  } else if (lastMove === true) {
    // styling for last move squares
    result['filter'] = 'hue-rotate(-20deg)'
  } else if (coordinates[0] === state.board.from[0] &&
  coordinates[1] === state.board.from[1]) {
    // styling for selected square
    result['filter'] = 'hue-rotate(40deg)'
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
    // TODO: let the user be both players unless in a match
    // configure this by: preview: moveable, both players; match: moveable, one player; form: moveable, both players,
    const pieceOwner = vnode.attrs.position[vnode.key].content.player
    // if a match hasn't started, don't add events
    if (state.board.matchStatus !== 'match started') {
      /* do nothing */
    // if it isn't our piece and its not highlighted, don't add events
    } else if ((pieceOwner !== state.matchmaking.player) && !highlighted) {
      /* do nothing */
    // if highlighted, click to attempt turn
    } else if (highlighted) {
      attrs.onclick = handleTurn()
    // if deselect is queued, handle it
    } else if (squareInArray(coordinates, [state.board.deselectable])) {
      attrs.onmouseup = handleDeselectPiece()
    // if the selected piece, let another mousedown queue deselect
    } else if (squareInArray(coordinates, [state.board.from])) {
      attrs.onmousedown = queueDeselect()
    // if not highlighted or selected and it's our turn, select the piece
    } else if (pieceOwner === state.game.turnNumber % 2) {
      attrs.onmousedown = handleSelectPiece()
    }
    return m('img.square#' + vnode.key, attrs)
  }
}

function handleTurn () {
  return (e) => {
    e.preventDefault()
    const from = state.board.from
    const to = e.target.id
    // attempt to take the turn
    const newState = chess.takeTurn(state.game, [from, to])
    console.log('handling turn', newState)
    // update the state if takeTurn doesn't throw
    state.game = newState
    state.board.highlightedSquares = []
    state.board.from = []
    sendMessage(state.game)
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
  console.log('array', array)
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
