import m from "mithril"
import chess from "./squadChessRules"
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
 * we generate a constant stream of events, which is bad. Maybe those events are coming
 * from the main document itself? So for now:
 */
document.addEventListener("dragover", (e) => {
  e.preventDefault();
}, false);

let from

function recordFrom() {
  return (e) => {
    from = e.target.id
  }
}

const BoardPiece = {
  view: (vnode) => {
    return m(
      'img#'+vnode.key, 
      { 
        src: vnode.attrs.imgLink,
        onmousedown: recordFrom(),
        style: {
          width: squareSize+'vw',
          height: squareSize+'vw'
        }
      }
    )
  }
}

function squareStyle(coordinates, squareColor) {
  return {
    position: 'absolute',
    right: (40+squareSize*coordinates[0])+'vw',
    top: (10+squareSize*coordinates[1])+'vw',
    display: 'flex',
    'flex-direction': 'column',
    'align-items': 'center',
    'justify-content': 'center',
    width: squareSize+'vw',
    height: squareSize+'vw',
    background: squareColor
  } 
}

function handleTurn(gameState) {
  return (e) => {
    e.preventDefault()
    const turn = { 
      from: chess.stringToSquare(from), 
      to: chess.stringToSquare(e.target.id)
    }
    const newState = chess.takeTurn(gameState, turn)
    state.game = newState
  }
}

const BoardSquare = {
  view: (vnode) => {
    // convert the string coordinates back to an array
    let coordinates = chess.stringToSquare(vnode.key)
    // create the checkerboard color pattern
    let squareColor = BOARD_CONFIG.squares.lightColor
    if ((coordinates[0] + coordinates[1]) % 2 == 1) { squareColor = BOARD_CONFIG.squares.darkColor }
    let boardPiece
    // if the square holds a piece, set the properties
    if (vnode.attrs.value) {
      // get the link to the piece graphic
      let imgLink
      let pieceColor = 'white'
      if (vnode.attrs.value.player === 1) { pieceColor = 'black' }
      // prioritize local images
      if (vnode.attrs.graphics.local) {
        imgLink = `./img/${vnode.attrs.graphics.local[pieceColor]}`
      } // else if (vnode.graphics.remote)...
      boardPiece = m(BoardPiece, { imgLink, key: vnode.key })
    }
    // if not, just return an empty square
    return m(
      `.square#${vnode.key}`,
      { 
        style: squareStyle(coordinates, squareColor), 
        ondrop: handleTurn(state.game)
      },
      boardPiece
    )
  }
}

const Board = {
  view: () => {
    return m(
      "#board",
      // For each square in the position
      Object.keys(state.game.position).map(squareId => {
        // grab what's in the square
        const value = state.game.position[squareId]
        // if there is a piece, grab links to piece images 
        let graphics
        if (value) {
          graphics = state.pieces[value.pieceId].graphics
        }
        // add the square to the board
        return m(
          BoardSquare, 
          { key: squareId, value, graphics }
        )
      })
    )
  }
}

export default Board