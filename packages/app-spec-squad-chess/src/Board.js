import m from "mithril"
import chess from "./rules"
import state from "./state.js"

const BOARD_CONFIG = {
  squares: {
    size: 5,
    lightColor: '#e5b578',
    darkColor: '#b67028'
  }
}

const squareSize = BOARD_CONFIG.squares.size

/* I don't totally understand what this general dragover listener is doing:
 * When I add similar 'ondragover' listeners on each component,
 * we generate a huge, constant stream of events, which is bad.
 * Maybe those events are coming from the main document itself? So for now:
 */
document.addEventListener("dragover", (e) => {
  e.preventDefault();
}, false);

// initialize or reset the 'board' part of the state
function resetBoardState() {
  state['board'] = {
    from: [],
    highlightedSquares: [],
    deselectable: []
  }
}

function queueDeselect() {
  return (e) => {
    state.board = Object.assign({}, state.board, {
      deselectable: chess.stringToSquare(e.target.id)
    })
  }
}

function handleDeselectPiece() {
  return resetBoardState
}

function handleSelectPiece() {
  return (e) => {
    // select the piece and highlight possible turns
    let from = chess.stringToSquare(e.target.id)
    let tos = []
    state.game.legalTurns.forEach(t => {
      if (from[0] === t.from[0] &&
        from[1] === t.from[1]) { tos.push(t.to) }
    })
    state.board = Object.assign({}, state.board, {
      from,
      highlightedSquares: tos
    })
  }
}

const BoardPiece = {
  view: (vnode) => {
    let attrs = {
      src: vnode.attrs.imgLink,
      style: {
        width: squareSize+'vw',
        height: squareSize+'vw'
      }
    }
    let coordinates = chess.stringToSquare(vnode.key)
    let highlighted = squareInArray(coordinates, state.board.highlightedSquares)
    // if highlighted, click to attempt turn
    if (highlighted) {
      attrs['onclick'] = handleTurn()
    // if deselect is queued, handle it
    } else if (squareInArray(coordinates, [state.board.deselectable])) {
      attrs['onmouseup'] = handleDeselectPiece()
    // if the selected piece, let another mousedown queue deselect
    } else if (squareInArray(coordinates, [state.board.from])) {
      attrs['onmousedown'] = queueDeselect()
    // if not highlighted or selected, select the piece
    } else {
      attrs['onmousedown'] = handleSelectPiece()
    }
    return m('img#'+vnode.key, attrs)
  }
}

function squareStyle(coordinates, squareColor, highlighted) {
  const result = {
    // TODO move the static CSS elsewhere
    right: (40+squareSize*coordinates[0])+'vw',
    top: (10+squareSize*coordinates[1])+'vw',
    width: squareSize+'vw',
    height: squareSize+'vw',
    background: squareColor
  }
  if (highlighted === true) {
    // highlighted square styling
    result['box-shadow'] = 'inset 0px 0px 0px 3px yellow'
  }
  return result
}

function handleTurn() {
  return (e) => {
    e.preventDefault()
    const turn = {
      from: state.board.from,
      to: chess.stringToSquare(e.target.id)
    }
    // attempt to take the turn
    const newState = chess.takeTurn(state.game, turn)
    // update the state if takeTurn doesn't throw
    state.game = newState
    state.board.highlightedSquares = []
    // if no legal turns, the game is over
    if (newState.legalTurns.length === 0) {
      let winner = 'White'
      if (newState.turnNumber % 2 === 0) { winner = 'Black'}
      console.log(`${winner} wins!`)
    }
  }
}

function squareInArray(square, array) {
  let result = false
  if (array.length === 0) { return result }
  array.forEach(s => {
    if (s[0] === square[0] && s[1] === square[1]) {
      result = true
    }
  })
  return result
}

const BoardSquare = {
  view: (vnode) => {
    // convert the string coordinates back to an array
    let coordinates = chess.stringToSquare(vnode.key)
    // create the checkerboard color pattern
    let squareColor = BOARD_CONFIG.squares.lightColor
    if ((coordinates[0] + coordinates[1]) % 2 == 1) { squareColor = BOARD_CONFIG.squares.darkColor }
    // highlight square
    let highlighted = squareInArray(coordinates, state.board.highlightedSquares)
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
        style: squareStyle(coordinates, squareColor, highlighted),
        ondrop: handleTurn(),
        onclick
      },
      squareContent
    )
  }
}

const Board = {
  oninit: resetBoardState,
  view: () => {
    return m(
      "#board",
      // For each square in the position
      Object.keys(state.game.position).map(squareId => {
        // grab what's in the square
        const content = state.game.position[squareId]
        // if there is a piece, grab links to piece images
        let graphics
        if (content) {
          graphics = state.pieces[content.pieceId].graphics
        }
        // add the square to the board
        return m(
          BoardSquare,
          { key: squareId, content, graphics }
        )
      })
    )
  }
}

export default Board
