import m from 'mithril'

import state from '../state.js'
import { getMarketInfo, withdrawWithAlerts } from '../utils.js'

const Withdraw = {
  oninit: () => {
    getMarketInfo()
  },
  view: () => {
    return m(
      '.withdraw',
      m(
        '.card.column',
        m('h3', 'Available withdrawals:'),
        m(CurrentWithdrawAmount),
        m(WithdrawButton)
      )
    )
  }
}

const CurrentWithdrawAmount = {
  view: () => {
    return m(
      'p.row',
      `${state.withdrawAmount} MT`
    )
  }
}

const WithdrawButton = {
  view: () => {
    return m(
      'button',
      { onclick: handleWithdraw },
      'Withdraw'
    )
  }
}

const handleWithdraw = () => {
  withdrawWithAlerts()
}

export default Withdraw
