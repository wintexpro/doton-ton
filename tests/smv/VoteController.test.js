const path = require('path')
const fs = require('fs')
const assert = require('assert')

describe('VoteController', function () {
  const manager = new Manager()
  let voteControllerKeys

  before(async function () {
    await manager.createClient(['http://localhost:80/graphql'])
    voteControllerKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../smv/VoteController.tvc'),
      path.join(__dirname, '../../smv/VoteController.abi.json'),
      { contractName: 'VoteController_1', keys: voteControllerKeys }
    )
    await manager.contracts.VoteController_1.deployContract({
      _proposalInitState: fs.readFileSync(path.join(__dirname, '../../smv/Proposal.tvc'), { encoding: 'base64' }),
      _ballotInitState: fs.readFileSync(path.join(__dirname, '../../smv/Ballot.tvc'), { encoding: 'base64' }),
      _deployInitialValue: 20000,
      _publicKey: '0x' + voteControllerKeys.public
    }, voteControllerKeys)
  })

  it('basic state asserts (runLocal for getters)', async function () {
    const deployInitialValueOutput = (await manager.client.contracts.runLocal({
      address: manager.contracts.VoteController_1.address,
      functionName: 'getDeployInitialValue',
      abi: manager.contracts.VoteController_1.contractPackage.abi,
      input: {}
    })).output
    assert.equal(20000, parseInt(deployInitialValueOutput.value0, 16))
    const ballotCodeOutput = (await manager.client.contracts.runLocal({
      address: manager.contracts.VoteController_1.address,
      functionName: 'getBallotCode',
      abi: manager.contracts.VoteController_1.contractPackage.abi,
      input: {}
    })).output
    assert.equal(ballotCodeOutput.ballotCode, fs.readFileSync(path.join(__dirname, '../../smv/Ballot.tvc'), { encoding: 'base64' }))
  })

  describe('initialValue changing', function () {
    it('should change initial value', async function () {
      const deployInitialValueOutput = parseInt((await manager.client.contracts.runLocal({
        address: manager.contracts.VoteController_1.address,
        functionName: 'getDeployInitialValue',
        abi: manager.contracts.VoteController_1.contractPackage.abi,
        input: {}
      })).output.value0, 16)
      await manager.contracts.VoteController_1.runContract('setDeployInitialValue', {
        _deployInitialValue: deployInitialValueOutput + 1
      }, voteControllerKeys)
      const deployNewInitialValueOutput = parseInt((await manager.client.contracts.runLocal({
        address: manager.contracts.VoteController_1.address,
        functionName: 'getDeployInitialValue',
        abi: manager.contracts.VoteController_1.contractPackage.abi,
        input: {}
      })).output.value0, 16)
      assert.equal(deployInitialValueOutput + 1, deployNewInitialValueOutput)
    })

    it('shouldn\'t change initial value', async function () {
      const deployInitialValueOutput = parseInt((await manager.client.contracts.runLocal({
        address: manager.contracts.VoteController_1.address,
        functionName: 'getDeployInitialValue',
        abi: manager.contracts.VoteController_1.contractPackage.abi,
        input: {}
      })).output.value0, 16)
      const anotherKeys = await manager.createKeysAndReturn()
      await assert.rejects(manager.contracts.VoteController_1.runContract('setDeployInitialValue', {
        _deployInitialValue: deployInitialValueOutput + 1
      }, anotherKeys), (err) => {
        assert.strictEqual(err.message, 'Contract execution was terminated with error')
        assert.strictEqual(err.data.description, 'Invalid signature')
        return true
      })
      const checkInitialValueOutput = parseInt((await manager.client.contracts.runLocal({
        address: manager.contracts.VoteController_1.address,
        functionName: 'getDeployInitialValue',
        abi: manager.contracts.VoteController_1.contractPackage.abi,
        input: {}
      })).output.value0, 16)
      assert.equal(deployInitialValueOutput, checkInitialValueOutput)
    })
  })

  describe('proposal creation', function () {
    let voteControllerKeys

    before(async function () {
      voteControllerKeys = await manager.createKeysAndReturn()
      await manager.loadContract(
        path.join(__dirname, '../../smv/VoteController.tvc'),
        path.join(__dirname, '../../smv/VoteController.abi.json'),
        { contractName: 'VoteController_2', keys: voteControllerKeys }
      )
      await manager.contracts.VoteController_2.deployContract({
        _proposalInitState: fs.readFileSync(path.join(__dirname, '../../smv/Proposal.tvc'), { encoding: 'base64' }),
        _ballotInitState: fs.readFileSync(path.join(__dirname, '../../smv/Ballot.tvc'), { encoding: 'base64' }),
        _deployInitialValue: 1000000,
        _publicKey: '0x' + voteControllerKeys.public
      }, voteControllerKeys)
    })

    it('VoteController should create proposal', async function () {
      const beforeAccountsCount = await manager.client.queries.getAccountsCount()
      const proposalKeys = await manager.createKeysAndReturn()
      await manager.contracts.VoteController_2.runContract('createProposal', {
        proposalPublicKey: '0x' + proposalKeys.public,
        proposalId: Math.floor(Math.random() * Math.floor(100)),
        votersAmount: 1
      }, voteControllerKeys).catch(e => console.log(e))
      const afterAccountsCount = await manager.client.queries.getAccountsCount()
      assert.equal(beforeAccountsCount, afterAccountsCount - 1)
    })
    it('VoteController should not create proposal with same id', async function () {
      const proposalKeys = await manager.createKeysAndReturn()
      await manager.contracts.VoteController_2.runContract('createProposal', {
        proposalPublicKey: '0x' + proposalKeys.public,
        proposalId: Math.floor(Math.random() * Math.floor(100)),
        votersAmount: 1
      }, voteControllerKeys).catch(e => console.log(e))
      assertError(
        manager.contracts.VoteController_2.runContract('createProposal', {
          proposalPublicKey: '0x' + proposalKeys.public,
          proposalId: Math.floor(Math.random() * Math.floor(100)),
          votersAmount: 1
        }, voteControllerKeys),
        100
      )
    })
    it('VoteController should return proposal info (naive)', async function () {
      const proposalId = Math.floor(Math.random() * Math.floor(100))
      const proposalKeys = await manager.createKeysAndReturn()
      const createProposalResult = await manager.contracts.VoteController_2.runContract('createProposal', {
        proposalPublicKey: '0x' + proposalKeys.public,
        proposalId,
        votersAmount: 1
      }, voteControllerKeys)
      const proposalByIdExecutionResult = await manager.client.contracts.runLocal({
        address: manager.contracts.VoteController_2.address,
        functionName: 'getProposalInfoById',
        abi: manager.contracts.VoteController_2.contractPackage.abi,
        input: { proposalId }
      })
      assert.strictEqual(proposalByIdExecutionResult.output.proposal.proposalAddress, createProposalResult.proposalAddress)
      assert.strictEqual(proposalByIdExecutionResult.output.proposal.proposalPublicKey, '0x' + proposalKeys.public)
      assert.strictEqual(1, parseInt(proposalByIdExecutionResult.output.proposal.votersAmount, 16))
    })
  })
})
