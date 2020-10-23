import m from 'mithril'

import state from '../state.js'

const Option = {
  view: (vnode) => {
    const id = vnode.attrs.id
    const options = vnode.attrs.options
    const callback = vnode.attrs.callback
    const currentSelection = options[vnode.attrs.currentSelection]
    delete options[vnode.attrs.currentSelection]
    return m(
      `.select.${state.menus[id]}`,
      m(
        'a.selected',
        { onclick: handleToggleOptions(id) },
        currentSelection
      ),
      m(Options, { id: vnode.attrs.id, options, callback })
    )
  }
}

const Options = {
  view: (vnode) => {
    let display = 'none'
    if (state.menus[vnode.attrs.id] === 'visible') { display = 'flex' }
    return m(
      '.options',
      Object.keys(vnode.attrs.options).map(i => {
        return m(
          `a.option#${i}`,
          {
            onclick: handleSaveOption(vnode.attrs.id, vnode.attrs.callback),
            style: { display }
          },
          vnode.attrs.options[i]
        )
      })
    )
  }
}

const handleSaveOption = (id, callback) => {
  return (event) => {
    callback(event.target.id)
    toggleOptions(id)
  }
}

const handleToggleOptions = (id) => {
  return () => {
    toggleOptions(id)
  }
}

function toggleOptions (id) {
  if (state.menus[id] !== 'visible') {
    state.menus[id] = 'visible'
  } else {
    state.menus[id] = 'hidden'
  }
}

export default Option
