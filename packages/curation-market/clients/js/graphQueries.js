const axios = require('axios').default

console.log('graphQueries loaded')

const query = `{ 
  contributions(first: 5) { 
    id
    supply
  }
}`

const url = 'http://localhost:8000/subgraphs/name/squadgames/subgraph'

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
    licenses(where: { owner: ${address} }) {
      id
      owner
      amount
      contribution
    }
  }`
  try {
    licenses = (await axios.post(url, { query })).data.data.licenses
  } catch (err) {
    console.error('Graph query error', err)
  }
  return licenses
}

async function contributionsBySupply () {
  let contributions
  const query = `{
    contributions(
      orderBy: supply, 
      orderDirection: desc
    ) {
      id
      name
      beneficiary
      feeRate
      purchasePrice
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

contributionsBySupply()
  .then(res => {
    console.log('contributionsBySupply', res)
  })
  .catch(err => {
    console.error('contributionsBySupply error', err)
  })

/* 
contributions
licenses

licenses by owner

contributions by supply
*/ 