import m from 'mithril'

import state from '../state.js'

const Alert = {
  view: (vnode) => {
    let index = state.alerts.indexOf(vnode.attrs.alert)
    if (state.alerts[index].deleted) {
      return
    }
    if (state.alerts[index].opacity !== 0) {
      state.alerts[index].opacity = 1
      setTimeout(() => {
        state.alerts[index].opacity = 0
        m.redraw()
      }, 4000)
    }
    if (state.alerts[index].deleted !== true) {
      setTimeout(() => {
        index = state.alerts.indexOf(vnode.attrs.alert)
        state.alerts[index].deleted = true
      }, 7000)
    }
    return m(
      '.alert',
      { style: { opacity: state.alerts[index].opacity } },
      m('.type', vnode.attrs.alert.type + ':'),
      m('.text', vnode.attrs.alert.text)
    )
  }
}

export default Alert