const axios = require('axios').default

console.log('graphQueries loaded')

const query = `{ 
  contributions(first: 5) { 
    id
    supply
  }
}`

const url = 'https://api.thegraph.com/subgraphs/name/squadgames/squad-chess-ropsten'
// const url = 'http://localhost:8000/subgraphs/name/squadgames/subgraph'

axios.post(url, { query })
  .then(res => {
    console.log('Axios response:', res)
  })
  .catch(err => {
    console.error('Axios error:', err)
  })

async function licensesOf (address) {
  let licenses
  const query = `{
    licenses(where: { owner: "${address}" }) {
      id
      owner
      amount
      contribution {
        id
        supply
        feeRate
      }
    }
  }`
  try {
    licenses = (await axios.post(url, { query })).data.data.licenses
    console.log('graph query licenses', licenses)
  } catch (err) {
    console.error('Graph query error', err)
  }
  return licenses
}

async function contributions () {
  let contributions
  const query = `{
    contributions(
      first: 1000
      orderBy: supply, 
      orderDirection: desc
    ) {
      id
      beneficiary
      feeRate
      purchasePrice
      definition
      supply
    }
  }`
  try {
    contributions = (await axios.post(url, { query })).data.data.contributions
  } catch (err) {
    console.error('Graph query error', err)
  }
  return contributions
}

async function contributionById (id) {
  let contribution
  const query = `{
    contributions(where: { id: "${id}" }) {
      id
      beneficiary
      feeRate
      purchasePrice
      definition
      supply
    }
  }`
  try {
    contribution = (await axios.post(url, { query })).data.data.contributions
  } catch (err) {
    console.error('Graph query error', err)
  }
  return contribution
}

module.exports = {
  licensesOf,
  contributions,
  contributionById
}
