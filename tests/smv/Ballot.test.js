/* eslint-disable dot-notation */
/**
 * Tests: contract Ballot.
 *
 * Run this tests from root directory: `ton-env test -p ./tests/smv/<current file name>.test.js`
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')

describe('Ballot', function () {
  // let manager

  before(async function () {
    console.log('Start..')
    await restart() // recreate and start containers
  })

  beforeEach(async function () {
    /* manager = new Manager()
    await manager.createClient(['http://localhost:80/graphql']) */

    /* const voteControllerKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../smv/VoteController.sol'),
      path.join(__dirname, '../../smv/VoteController.abi.json'),
      { keys: voteControllerKeys }
    )
    await manager.contracts['VoteController'].deployContract({
      _proposalInitState: fs.readFileSync(path.join(__dirname, '../../smv/Proposal.tvc'), { encoding: 'base64' }),
      _ballotInitState: fs.readFileSync(path.join(__dirname, '../../smv/Ballot.tvc'), { encoding: 'base64' }),
      _deployInitialValue: 20000,
      _publicKey: '0x' + voteControllerKeys.public
    }, voteControllerKeys) */
  })

  // fucntion wait while smart-contract has been deployed on `address`
  async function deployCheck (address, _manager) {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const accountInfo = await _manager.client.queries.accounts.query({ id: { eq: address } }, 'id')
      // console.log('address:', accountInfo)
      if (accountInfo.length > 0) break
    }
  }

  it.only('Test (in net.ton.dev): vote + onBounce - should rollback Ballot state if proposal throw exception (case with invalid init state)', async function () {
    const devMgr = new Manager()
    await devMgr.createClient(['net.ton.dev']) // http://localhost:80/graphql for local test

    // import giver
    await devMgr.addContractFromAddress(
      '0:440c99337a4009fec7ad4895a08587f05ab98b9d5c341dfb2211d1c862f1ae78',
      path.join(__dirname, '../../CustomGiverForDevNet/WintexGiver.abi.json'),
      'WintexGiver'
    )
    const wintexGiverKeysObject = JSON.parse(fs.readFileSync(path.join(__dirname, '../../CustomGiverForDevNet/WintexGiver.keys.json')))

    // Deployment the VoteController:
    const voteControllerKeys = await devMgr.createKeysAndReturn()
    await devMgr.loadContract(
      path.join(__dirname, '../../smv/VoteController.tvc'),
      path.join(__dirname, '../../smv/VoteController.abi.json'),
      { keys: voteControllerKeys, contractName: 'VoteController' }
    )
    // send grams to future VoteController address
    console.log('send grams..')
    await devMgr.contracts['WintexGiver'].runContract('sendMeGramsPls', { dest: devMgr.contracts['VoteController'].address, amount: 1000000000 }, wintexGiverKeysObject)
    await new Promise(resolve => setTimeout(resolve, 10000))
    // await devMgr.giveToAddress(devMgr.contracts['VoteController'].address).catch(e => console.log('e::', e)) // only for local test
    // deploy VoteController
    console.log('will deploy VoteController, address:', devMgr.contracts['VoteController'].address)
    await devMgr.contracts['VoteController'].deployContract({
      _proposalInitState: fs.readFileSync(path.join(__dirname, '../../smv/Proposal.tvc'), { encoding: 'base64' }),
      _ballotInitState: fs.readFileSync(path.join(__dirname, '../../smv/Ballot.tvc'), { encoding: 'base64' }),
      _deployInitialValue: 200000000,
      _publicKey: '0x' + voteControllerKeys.public
    }, false, voteControllerKeys).catch(e => console.log('deployContract VoteController:', e))
    await deployCheck(devMgr.contracts['VoteController'].address, devMgr)
    console.log('VoteController address:', devMgr.contracts['VoteController'].address)

    // Deployment the proposal
    const proposalKeys = await devMgr.createKeysAndReturn()
    const deployProposalRes = await devMgr.contracts['VoteController'].runContract('createProposal', {
      proposalPublicKey: '0x' + proposalKeys.public,
      proposalId: Math.floor(Math.random() * Math.floor(100)),
      votersAmount: 1
    }, voteControllerKeys)

    await deployCheck(deployProposalRes.proposalAddress, devMgr)
    await devMgr.addContractFromAddress(
      deployProposalRes.proposalAddress,
      path.join(__dirname, '../../smv/Proposal.abi.json'),
      'Proposal',
      proposalKeys
    ) // add contract to manager
    devMgr.contracts['Proposal'].address = deployProposalRes.proposalAddress
    assert.deepStrictEqual(devMgr.contracts['Proposal'].isDeployed, true)
    console.log('Proposal address::', deployProposalRes.proposalAddress)

    // Deployment the Ballot:
    const ballotKeys = await devMgr.createKeysAndReturn()
    await devMgr.loadContract(
      path.join(__dirname, '../../smv/Ballot.tvc'),
      path.join(__dirname, '../../smv/Ballot.abi.json'),
      { keys: ballotKeys }
    )
    // send grams to future Ballot address
    await devMgr.contracts['WintexGiver'].runContract('sendMeGramsPls', { dest: devMgr.contracts['Ballot'].address, amount: 500000000 }, wintexGiverKeysObject)
    // await devMgr.giveToAddress(devMgr.contracts['Ballot'].address).catch(e => console.log('e::', e)) // only for local test
    // deploy Ballot
    await devMgr.contracts['Ballot'].deployContract({}, false, ballotKeys)
    console.log('Ballot address:', devMgr.contracts['Ballot'].address)

    // Deployment the bad Ballot:
    const badBallotKeys = await devMgr.createKeysAndReturn()
    await devMgr.loadContract(
      path.join(__dirname, './files/Ballot.tvc'),
      path.join(__dirname, './files/Ballot.abi.json'),
      { keys: badBallotKeys, contractName: 'BadBallot' }
    )
    // send grams to future bad Ballot address
    await devMgr.contracts['WintexGiver'].runContract('sendMeGramsPls', { dest: devMgr.contracts['BadBallot'].address, amount: 500000000 }, wintexGiverKeysObject)
    // await devMgr.giveToAddress(devMgr.contracts['BadBallot'].address).catch(e => console.log('e::', e)) // only for local test
    // deploy Ballot
    await devMgr.contracts['BadBallot'].deployContract({}, false, badBallotKeys)
    console.log('Bad Ballot address:', devMgr.contracts['Ballot'].address)

    // try fote for proposal from bad ballot
    await devMgr.contracts['BadBallot'].runContract('vote', { choice: 1, proposal: devMgr.contracts['Proposal'].address }, badBallotKeys)
    await new Promise(resolve => setTimeout(resolve, 15000))

    // check that proposal state was not changed
    const getYesVotesRes = await devMgr.contracts['Proposal'].runLocal('getYesVotes', {}) // .runContract('getYesVotes', {}, proposalKeys)
    console.log('getYesVotesRes:', getYesVotesRes)
    assert.deepStrictEqual(getYesVotesRes.output.yesVotes, '0x0')
    // check that onBounce handler did work correctly
    const getInfoRes = await devMgr.contracts['BadBallot'].runLocal('getInfo', {}, badBallotKeys) // runContract('getInfo', {}, badBallotKeys)
    console.log('getInfoRes:', getInfoRes)
    assert.deepStrictEqual(getInfoRes.output.value0, false)
    assert.deepStrictEqual(getInfoRes.output.value1, '0')
  })
})
