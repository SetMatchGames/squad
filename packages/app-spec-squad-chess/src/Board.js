import m from "mithril"

const BOARD_CONFIG = {
  squares: {
    size: 5,
    lightColor: '#e5b578',
    darkColor: '#b67028'
  }
}

const squareSize = BOARD_CONFIG.squares.size

function squareToCircle(key) {
  console.log(key)
}

const BoardPiece = {
  view: (vnode) => {
    return m(
      'img', 
      { 
        src: vnode.attrs.imgLink,
        onclick: () => squareToCircle(vnode.attrs.key),
        style: {
          width: squareSize+'vw',
          height: squareSize+'vw'
        }
      }
    )
  }
}

function squareStyle(coordinates, squareColor, pieceColor) {
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
    background: squareColor,
    color: pieceColor
  } 
}

const BoardSquare = {
  view: (vnode) => {
    // convert the string coordinates back to an array
    let coordinates = vnode.attrs.key.split(',').map(x => parseInt(x))
    // create the checkerboard color pattern
    let squareColor = BOARD_CONFIG.squares.lightColor
    if ((coordinates[0] + coordinates[1]) % 2 == 1) { squareColor = BOARD_CONFIG.squares.darkColor }
    // if the square holds a piece, return the piece as well
    if (vnode.attrs.value) {
      // get the link to the piece graphic
      let pieceColor = 'white'
      if (vnode.attrs.value.player === 1) { pieceColor = 'black' }
      let imgLink = ''
      // prioritize local images
      if (vnode.attrs.graphics.local) {
        console.log(vnode.attrs.graphics.local[pieceColor])
        imgLink = `./public/img/${vnode.attrs.graphics.local[pieceColor]}`
      } // else if (vnode.graphics.remote)...
      return m(
        `.square#${vnode.attrs.key}`,
        { style: squareStyle(coordinates, squareColor, pieceColor) },
        m(BoardPiece, { imgLink })
      )
    }
    // if not, just return the square
    return m(
      `.square#${vnode.attrs.key}`, 
      { style: squareStyle(coordinates, squareColor) }
    )
  }
}

const Board = {
  view: (vnode) => {
    return m(
      "#board",
      // For each square in the position
      Object.keys(vnode.attrs.position).map(squareId => {
        // grab what's in the square
        const value = vnode.attrs.position[squareId]
        let graphics = {}
        // if there is a piece, grab links to piece images 
        if (value) {
          graphics = vnode.attrs.pieces[value.pieceId].graphics
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