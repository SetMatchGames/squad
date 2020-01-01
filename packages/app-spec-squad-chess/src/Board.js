import m from "mithril"

function squareToCircle(id) {
  console.log(id)
}

const Piece = {}

function squareStyle(coordinates, squareColor, pieceColor) {
  return {
    position: 'absolute',
    right: 3*coordinates[0]+'em',
    top: 3*coordinates[1]+'em',
    display: 'flex',
    'flex-direction': 'column',
    'align-items': 'center',
    'justify-content': 'center',
    width: '3em',
    height: '3em',
    background: squareColor,
    color: pieceColor
  } 
}

const Square = {
  view: (vnode) => {
    let coordinates = vnode.attrs.key.split(',').map(x => parseInt(x))
    let squareColor = 'tan'
    if ((coordinates[0] + coordinates[1]) % 2 == 1) { squareColor = 'brown' }
    if (vnode.attrs.value) {
      let pieceColor = 'white'
      if (vnode.attrs.value.player === 1) { pieceColor = 'black' }
      return m(
        `.square#${vnode.attrs.key}`,
        { 
          onclick: () => squareToCircle(vnode.attrs.key), 
          style: squareStyle(coordinates, squareColor, pieceColor)
        },
        vnode.attrs.value.pieceId
      )
    }
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
      Object.keys(vnode.attrs.position).map(squareId => {
        return m(Square, { key: squareId, value: vnode.attrs.position[squareId] })
      })
    )
  }
}

export default Board