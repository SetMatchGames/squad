import m from "mithril"

let state = {
  squares: {
    1: "SQUARE"
  }
}

function squareToCircle(id) {
  state.squares[id] = "CIRCLE"
  console.log('clicked')
}

const Square = {
  view: (vnode) => {
    return m(".square",
      { onclick: () => squareToCircle(vnode.attrs.id) },
      state.squares[vnode.attrs.id]
    )
  }
}

const Board = {
  view: (vnode) => {
    return m("#board",
      m(Square, { id: 1 })
    )
  }
}

export default Board