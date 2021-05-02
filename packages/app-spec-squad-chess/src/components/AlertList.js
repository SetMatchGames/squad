import m from 'mithril'

import state from '../state.js'

import Alert from './Alert.js'

const AlertList = {
  view: () => {
    console.log('alert list current alerts', state.alerts)
    return m(
      '#alert-list',
      state.alerts.map(n => {
        return m(Alert, { alert: n })
      })
    )
  }
}

export default AlertList
