import m from 'mithril'
import state from '../state.js'
import Board from '../components/Board.js'
import Licenses from '../components/Licenses.js'
import { 
  shortHash, 
  handleLoadContributions, 
  handleLoadLicenses, 
  previewFormat 
} from '../utils.js'

const FormatStore = {
  oninit: () => {
    handleLoadContributions()
    handleLoadLicenses()
    state.markets.previewedFormats = {}
  },
  view: () => {
    if (!state.squad.orderedFormats) {
      return m(
        '#format-store.body',
        'Loading formats...'
      )
    }
    return m(
      '#format-store.body',
      m('h2', 'Choose a Format to Play'),
      m(FormatSearch),
      m(Labels),
      state.squad.orderedFormats
        .filter((format) => {
          return (!state.markets.searchedFormat || format.id === state.markets.searchedFormat)
        })
        .map((format, index) => {
          let order = 'middle'
          if (index === 0) { order = 'head' }
          if (index === state.squad.orderedFormats.length - 1) {
            order = 'foot'
          }
          const score = shortenScore(format.supply)
          return m(FormatCard, { key: format.id, order, score })
        })
    )
  }
}

const FormatSearch = {
  view: () => {
    return m(
      '.search-bar',
      m(
        'input[type=text]', 
        { value: state.markets.idToSearch, oninput: handleSaveSearch },
        'Enter ID'
      ),
      m(
        'button',
        { onclick: saveSearch },
        'Find format'
      ),
      m(
        'button',
        { onclick: resetSearch },
        'Show all'
      )
    )
  }
}

const Labels = {
  view: () => {
    return m(
      '.format-card.labels.row',
      m('.score.offset', 'Market Score'),
      m('.name.offset', 'Name'),
      m('.loader'),
      m('.market-toggle'),
      m('.details-toggle')
    )
  }
}

const FormatCard = {
  view: (vnode) => {
    if (!state.squad.rawFormats[vnode.key]) { return }
    const name = state.squad.rawFormats[vnode.key].name
    return m(
      `.format-card.column.${vnode.attrs.order}`,
      m(
        '.info.row',
        m('.score.offset', vnode.attrs.score),
        m('.name.offset', name),
        m(
          '.button-section',
          m(Loader, { address: vnode.key }),
          m(DetailsToggle, { address: vnode.key })
        )
      ),
      m(Details, { address: vnode.key })
    )
  }
}

const DetailsToggle = {
  view: (vnode) => {
    const address = vnode.attrs.address
    let content = 'Details'
    if (state.markets.previewedFormat &&
    state.markets.previewedFormat.address === address) {
      content = 'Hide'
    }
    return m(
      'form.details-toggle',
      m(
        'button',
        { onclick: handleToggleDetailsFactory(address) },
        content
      )
    )
  }
}

const Details = {
  view: (vnode) => {
    const address = vnode.attrs.address
    if (!state.markets.previewedFormat ||
    state.markets.previewedFormat.address !== address) {
      return
    }
    const description = state.markets.previewedFormat.description || ''
    return m(
      '.details',
      m('.board-row.row', m(Board, {
        format: state.markets.previewedFormat,
        position: state.markets.previewedFormat.startingPosition,
        matchStatus: 'no match'
      })),
      m('.row', m('label', 'Description: '), m('.data', description)),
      m('.row', m('label', 'ID: '), m('.data', shortHash(address))),
      m(Licenses, { address })
    )
  }
}

const Loader = {
  view: (vnode) => {
    const address = vnode.attrs.address
    let owned = false
    if (state.licenses[address]) {
      owned = true
    }
    return m(
      'form.loader',
      m(
        'button',
        { onclick: handleLinkFactory(address), disabled: !owned },
        'Play'
      )
    )
  }
}

const handleToggleDetailsFactory = (address) => {
  return (e) => {
    e.preventDefault()
    if (state.markets.previewedFormat &&
    state.markets.previewedFormat.address === address) {
      state.markets.previewedFormat = null
    } else {
      previewFormat(address)
    }
  }
}

const handleLinkFactory = (address) => {
  return (e) => {
    e.preventDefault()
    m.route.set('/matchmaking/:formatAddress', { formatAddress: address })
  }
}

const handleSaveSearch = (e) => {
  e.preventDefault()
  console.log('trying to save search', e.target)
  state.markets.idToSearch = e.target.value
}

const saveSearch = (e) => {
  e.preventDefault()
  console.log('trying to save search', state.markets.idToSearch, state.squad.rawFormats)
  // search loaded contributions for that id, then set state.markets.searchedFormat
  if (state.squad.rawFormats[state.markets.idToSearch]) {
    console.log('setting searched format', state.markets.idToSearch)
    state.markets.searchedFormat = state.markets.idToSearch
  }
}

const resetSearch = (e) => {
  e.preventDefault()
  delete state.markets.searchedFormat
}

function shortenScore (score) {
  if (!(score + 1)) { return }
  let result = String(score)
  result = result.split('.')[0]
  if (result.length > 7) {
    let count = 0
    let length = result.length
    while (length > 3 && count < 5) {
      result = result.slice(0, -3)
      count += 1
      length -= 3
    }
    let suffix = 'K'
    switch (count) {
      case 2:
        suffix = 'M'
        break
      case 3:
        suffix = 'B'
        break
      case 4:
        suffix = 't'
        break
      default:
    }
    result += suffix
  }
  return result
}

export default FormatStore
