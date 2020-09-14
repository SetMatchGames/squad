import m from 'mithril'

import state from '../state.js'

const Alert = {
  oninit: (vnode) => {
    let index = state.alerts.indexOf(vnode.attrs.alert)
    state.alerts[index].opacity = 1
    setTimeout(() => {
      state.alerts[index].opacity = 0
    }, 4000)
    setTimeout(() => {
      index = state.alerts.indexOf(vnode.attrs.alert)
      state.alerts.splice(index, 1)
    }, 7000)
  },
  view: (vnode) => {
    const index = state.alerts.indexOf(vnode.attrs.alert)
    return m(
      '.alert',
      { style: { opacity: state.alerts[index].opacity } },
      m('.type', vnode.attrs.alert.type + ':'),
      m('.text', vnode.attrs.alert.text)
    )
  }
}

export default Alert