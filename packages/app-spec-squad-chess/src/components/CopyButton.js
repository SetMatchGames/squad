import m from 'mithril'

import state from '../state.js'

const CopyButton = {
  view: (vnode) => {
    return m(
      '.copy-link',
      m(
        '.inline-button',
        {
          onclick: (e) => {
            e.preventDefault()
            console.log('copying link', vnode.attrs.text)
            navigator.clipboard.writeText(vnode.attrs.text).then(() => {
              const [type, text] = [`Copied ${vnode.attrs.textName}`, vnode.attrs.text]
              console.log('Creating alert', type, text)
              const alert = { type, text }
              state.alerts.push(alert)
              m.redraw()
            })
          }
        },
        '📋'
      )
    )
  }
}

export default CopyButton
