import m from 'mithril'
import state from '../state.js'
import Board from '../components/Board.js'
import Licenses from '../components/Licenses.js'
import CopyButton from '../components/CopyButton.js'
import {
  shortHash,
  handleLoadContributions,
  handleLoadLicenses,
  previewVariant
} from '../utils.js'

const VariantStore = {
  oninit: () => {
    handleLoadContributions()
    handleLoadLicenses()
    state.markets.previewedVariants = {}
  },
  view: () => {
    if (!state.squad.orderedVariants) {
      return m(
        '#variant-store.body',
        'Loading variants...'
      )
    }
    return m(
      '#variant-store.body',
      m('h2', 'Choose a Variant to Play'),
      m(VariantSearch),
      m(Labels),
      state.squad.orderedVariants
        .filter((variant) => {
          return (!state.markets.searchedVariant || variant.id === state.markets.searchedVariant)
        })
        .map((variant, index) => {
          let order = 'middle'
          if (index === 0) { order = 'head' }
          if (index === state.squad.orderedVariants.length - 1) {
            order = 'foot'
          }
          const score = shortenScore(variant.supply)
          return m(VariantCard, { key: variant.id, order, score })
        })
    )
  }
}

const VariantSearch = {
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
        'Find variant by ID'
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
      '.variant-card.labels.row',
      m('.score.offset', 'Market Score'),
      m('.name.offset', 'Name'),
      m('.loader'),
      m('.market-toggle'),
      m('.details-toggle')
    )
  }
}

const VariantCard = {
  view: (vnode) => {
    if (!state.squad.rawVariants[vnode.key]) { return }
    const name = state.squad.rawVariants[vnode.key].name
    return m(
      `.variant-card.column.${vnode.attrs.order}`,
      m(
        '.info.row',
        m('.score.offset', vnode.attrs.score),
        m('.name.offset', name, m(CopyButton, { text: vnode.key, textName: 'variant ID' })),
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
    if (state.markets.previewedVariant &&
    state.markets.previewedVariant.address === address) {
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
    if (!state.markets.previewedVariant ||
    state.markets.previewedVariant.address !== address) {
      return
    }
    const content = [
      m('.board-row.row', m(Board, {
        variant: state.markets.previewedVariant,
        position: state.markets.previewedVariant.startingPosition,
        matchStatus: 'no match'
      })),
      m('.row', m('label', 'ID: '), m('.data', shortHash(address)), m(CopyButton, { text: address, textName: 'variant ID' })),
      m('.row', m('label', 'Refund rate: '), m('.data', `${100 - state.squad.rawVariants[vnode.attrs.address].fee}%`)), // TODO tooltip explaining this
      m(Licenses, { address })
    ]
    if (state.markets.previewedVariant.description) {
      const description = state.markets.previewedVariant.description
      content.splice(1, 0, m('.row', m('label', 'Description: '), m('.data', description)))
    }
    return m(
      '.details',
      content
    )
  }
}

const Loader = {
  view: (vnode) => {
    const address = vnode.attrs.address
    let owned = false
    if (state.licenses && state.licenses[address]) {
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
    if (state.markets.previewedVariant &&
    state.markets.previewedVariant.address === address) {
      state.markets.previewedVariant = null
    } else {
      previewVariant(address)
    }
  }
}

const handleLinkFactory = (address) => {
  return (e) => {
    e.preventDefault()
    m.route.set('/matchmaking/:variantAddress', { variantAddress: address })
  }
}

const handleSaveSearch = (e) => {
  e.preventDefault()
  console.log('trying to save search', e.target)
  state.markets.idToSearch = e.target.value
}

const saveSearch = (e) => {
  e.preventDefault()
  console.log('trying to save search', state.markets.idToSearch, state.squad.rawVariants)
  // search loaded contributions for that id, then set state.markets.searchedVariant
  if (state.squad.rawVariants[state.markets.idToSearch]) {
    console.log('setting searched variant', state.markets.idToSearch)
    state.markets.searchedVariant = state.markets.idToSearch
  }
}

const resetSearch = (e) => {
  e.preventDefault()
  delete state.markets.searchedVariant
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

export default VariantStore
