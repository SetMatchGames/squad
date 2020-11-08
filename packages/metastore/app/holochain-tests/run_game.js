const { Config, Scenario } = require('@holochain/holochain-nodejs')
const squad = require('../../sdk/js')

Scenario.setTape(require('tape'))

const dnaPath = './dist/squad.dna.json'
const agentAlice = Config.agent('alice')
const dna = Config.dna(dnaPath)
const instanceAlice = Config.instance(agentAlice, dna)
const scenario = new Scenario([instanceAlice])

const mockRunnerCalls = []

const baseMockRunner = (formatAddress, data, calls) => {
  calls.push([formatAddress, data])
}

const mockRunner = (format, data) => {
  return baseMockRunner(format, data, mockRunnerCalls)
}

const testRunnerCalls = []

const testRunner = (format, data) => {
  return baseMockRunner(format, data, testRunnerCalls)
}

const mockGames = {
  mockGameAddress: {
    Ok: {
      Game: {
        name: 'Mock Valid Game',
        type_: 'Mock',
        data: 'mock game data'
      }
    }
  },
  testGameAddress: {
    Ok: {
      Game: {
        name: 'Test Valid Game',
        type_: 'Test',
        data: 'test data'
      }
    }
  }
}

const mockConductor = (validateCall) => {
  return {
    on: (_, f) => f(),
    call: (method, params) => {
      if (method === 'info/instances') {
        return [{ id: 'mockInstanceId', agent: 'mockAgent' }]
      }
      validateCall(method, params)
      return new Promise((resolve, reject) => {
        resolve(JSON.stringify(mockGames[params.params.address]))
      })
    }
  }
}

squad.registerRunner('Mock', mockRunner)
squad.registerRunner('Test', testRunner)

// TODO this doesn't need holochain's test harness anymore
//      we are mocking the holochain connection
const test_func = async (t, { alice }) => {
  const testCases = [
    {
      gameAddress: 'mockGameAddress',
      calls: mockRunnerCalls,
      formatAddress: 'mockFormatAddress',
      gameData: 'mock game data'
    }, {
      gameAddress: 'testGameAddress',
      calls: testRunnerCalls,
      formatAddress: 'mockFormatAddress',
      gameData: 'test data'
    }
  ]

  const checkTestCase = async c => {
    // register a mock connection that will test the correct
    // call values when called
    squad.mockConnection(mockConductor((method, params) => {
      t.equal(method, 'call', 'connection call method')
      t.deepEqual(params, {
        instance_id: 'mockInstanceId',
        zome: 'elements',
        function: 'get_element',
        params: {
          address: c.gameAddress
        }
      }, 'connection call params')
    }))

    await squad.runGame(c.gameAddress, c.formatAddress)

    // confirm that the right runner was called with the right stuff
    t.deepEqual(
      c.calls.pop(),
      [c.formatAddress, c.gameData],
      'runner call'
    )
  }

  await checkTestCase(testCases[0])
  await checkTestCase(testCases[1])
}

module.exports = {
  scenario: scenario,
  descripion: 'runGame runs the right game with the right data',
  func: test_func
}
