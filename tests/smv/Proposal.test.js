const path = require('path')
const fs = require('fs')
const assert = require('assert')

describe('Proposal tests', function () {
  const manager = new Manager()
  let voteControllerKeys

  before(async function () {
    await restart()
    await manager.createClient(['http://localhost:80/graphql'])
    voteControllerKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../smv/VoteController.tvc'),
      path.join(__dirname, '../../smv/VoteController.abi.json'),
      { contractName: 'vc', keys: voteControllerKeys }
    )
    await manager.contracts.vc.deployContract({
      _proposalInitState: fs.readFileSync(path.join(__dirname, '../../smv/Proposal.tvc'), { encoding: 'base64' }),
      _ballotInitState: fs.readFileSync(path.join(__dirname, '../../smv/Ballot.tvc'), { encoding: 'base64' }),
      _deployInitialValue: 1000000,
      _publicKey: '0x' + voteControllerKeys.public
    }, voteControllerKeys)
  })

  async function createProposal (voteController, keys, id) {
    const creationResult = await voteController.runContract('createProposal', {
      proposalPublicKey: '0x' + keys.public,
      proposalId: id,
      votersAmount: 10
    }, voteControllerKeys)
    await manager.addContractFromAddress(
      creationResult.proposalAddress,
      path.join(__dirname, '../../smv/Proposal.abi.json'),
      'p' + id,
      keys
    )
    return manager.contracts['p' + id]
  }

  it('perform some votes and returns vote info', async function () {
    const firstProposalKeys = await manager.createKeysAndReturn()
    const firstProposal = await createProposal(manager.contracts.vc, firstProposalKeys, 1)
    const ballotKeys = []
    for (let i = 0; i < 10; i++) {
      const keys = await manager.createKeysAndReturn()
      ballotKeys.push(keys)
      await manager.loadContract(
        path.join(__dirname, '../../smv/Ballot.tvc'),
        path.join(__dirname, '../../smv/Ballot.abi.json'),
        { keys: keys, contractName: 'b' + i }
      )
      await manager.contracts['b' + i].deployContract({}, true, keys)
    }
    for (let i = 0; i < 3; i++) {
      await manager.contracts['b' + i].runContract('vote', { choice: 1, proposal: firstProposal.address }, ballotKeys[i])
    }
    for (let i = 3; i < 10; i++) {
      await manager.contracts['b' + i].runContract('vote', { choice: 0, proposal: firstProposal.address }, ballotKeys[i])
    }
    const getYesVotesRes = await firstProposal.runLocal('getYesVotes', {})
    assert.strictEqual(3, parseInt(getYesVotesRes.output.yesVotes, 16))
    const getNoVotesRes = await firstProposal.runLocal('getNoVotes', {})
    assert.strictEqual(7, parseInt(getNoVotesRes.output.noVotes, 16))
  })
})
