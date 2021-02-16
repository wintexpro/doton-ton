const assert = require('assert')
const fs = require('fs')
const path = require('path')
const toHex = require('../helper').toHex
const crypto = require('crypto')

describe('Bridge. Some full and direct.', function () {
  const zeroAddress = '0:0000000000000000000000000000000000000000000000000000000000000000'
  before(async function () {
    console.log('Start..')
    // await restart() // recreate and start containers
    await new Promise(resolve => setTimeout(resolve, 5000))
  })

  async function deployAndPrepareBridgeComponents (isOwnerOfT3RootInternal = true) {
    const manager = new Manager()
    await manager.createClient(['http://localhost:80/graphql'])
    // load proposal only for getting CODE for deploy another components
    const proposalKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/Proposal.tvc'),
      path.join(__dirname, '../../build/Proposal.abi.json')
    )
    // load and deploy access controller
    const accessControllerKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/AccessController.tvc'),
      path.join(__dirname, '../../build/AccessController.abi.json'),
      { contractName: 'ac', keys: accessControllerKeys }
    )
    await manager.contracts.ac.deployContract({
      _accessCardInitState: fs.readFileSync(path.join(__dirname, '../../build/Relayer.tvc'), { encoding: 'base64' }),
      _initialValue: 1000000
    })
    // load bridge
    const bridgeKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/Bridge.tvc'),
      path.join(__dirname, '../../build/Bridge.abi.json'),
      { contractName: 'b', keys: bridgeKeys }
    )
    // load and deploy bridge vote controller
    const bridgeVoteControllerKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/BridgeVoteController.tvc'),
      path.join(__dirname, '../../build/BridgeVoteController.abi.json'),
      { contractName: 'bvc', keys: bridgeVoteControllerKeys }
    )
    await manager.contracts.bvc.deployContract({
      _proposalCode: (await manager.client.contracts.getCodeFromImage({ imageBase64: manager.contracts.Proposal.contractPackage.imageBase64 })).codeBase64,
      _deployInitialValue: 2000000000,
      _publicKey: '0x' + bridgeVoteControllerKeys.public,
      _proposalPublicKey: '0x' + proposalKeys.public,
      _proposalVotersAmount: 2,
      _bridgeAddress: await manager.contracts.b.futureAddress()
    })
    // load valid relayers
    const firstRelayerKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/Relayer.tvc'),
      path.join(__dirname, '../../build/Relayer.abi.json'),
      { contractName: 'r1', keys: firstRelayerKeys }
    )
    const secondRelayerKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/Relayer.tvc'),
      path.join(__dirname, '../../build/Relayer.abi.json'),
      { contractName: 'r2', keys: secondRelayerKeys }
    )
    // deploy bridge
    await manager.contracts.b.deployContract({
      _relayerInitState: fs.readFileSync(path.join(__dirname, '../../build/Relayer.tvc'), { encoding: 'base64' }),
      _accessControllerAddress: manager.contracts.ac.address,
      _voteControllerAddress: manager.contracts.bvc.address
    })
    // load and deploy handler
    const handlerKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/MessageHandler.tvc'),
      path.join(__dirname, '../../build/MessageHandler.abi.json'),
      { contractName: 'h', keys: handlerKeys }
    )
    await manager.contracts.h.deployContract({
      _proposalCode: (await manager.client.contracts.getCodeFromImage({ imageBase64: manager.contracts.Proposal.contractPackage.imageBase64 })).codeBase64,
      _bridgeVoteControllerAddress: manager.contracts.bvc.address,
      _bridgeVoteControllerPubKey: '0x' + bridgeVoteControllerKeys.public
    })
    // load tip3 handler
    const tip3handlerKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/Tip3Handler.tvc'),
      path.join(__dirname, '../../build/Tip3Handler.abi.json'),
      { contractName: 'th', keys: tip3handlerKeys }
    )
    // load tip3 wallet
    const tip3WalletKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/TONTokenWallet.tvc'),
      path.join(__dirname, '../../build/TONTokenWallet.abi.json'),
      { contractName: 'tip3w', keys: tip3WalletKeys }
    )
    // deploy tip3 root
    const tip3RootKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/RootTokenContract.tvc'),
      path.join(__dirname, '../../build/RootTokenContract.abi.json'),
      { contractName: 'tip3root', keys: tip3RootKeys }
    )
    await manager.contracts.tip3root.complicatedDeploy({}, {}, {
      _randomNonce: '0x' + crypto.createHash('sha256').update(crypto.randomBytes(32)).digest('hex'),
      wallet_code: (await manager.client.contracts.getCodeFromImage({ imageBase64: manager.contracts.tip3w.contractPackage.imageBase64 })).codeBase64,
      name: toHex('Test', false),
      symbol: toHex('TST', false),
      decimals: 0,
      root_public_key: isOwnerOfT3RootInternal ? 0 : '0x' + tip3RootKeys.public,
      root_owner_address: isOwnerOfT3RootInternal ? await manager.contracts.th.futureAddress() : zeroAddress
    }).catch((e) => {
      console.log(e)
    })
    // deploy test tip3 wallet
    await manager.contracts.tip3w.complicatedDeploy({}, {}, {
      // name: toHex('Test', false),
      // symbol: toHex('TST', false),
      // decimals: 0,
      // root_public_key: '0x' + tip3RootKeys.public,
      wallet_public_key: '0x' + tip3WalletKeys.public,
      root_address: manager.contracts.tip3root.address,
      code: (await manager.client.contracts.getCodeFromImage({ imageBase64: manager.contracts.tip3w.contractPackage.imageBase64 })).codeBase64,
      owner_address: zeroAddress
    })
    // deploy tip3 handler
    await manager.contracts.th.deployContract({
      _proposalCode: (await manager.client.contracts.getCodeFromImage({ imageBase64: manager.contracts.Proposal.contractPackage.imageBase64 })).codeBase64,
      _bridgeVoteControllerAddress: manager.contracts.bvc.address,
      _bridgeVoteControllerPubKey: '0x' + bridgeVoteControllerKeys.public,
      _tip3RootAddress: manager.contracts.tip3root.address
    })
    // load and deploy burned tokens handler
    const burnedTokensHandlerKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/BurnedTokensHandler.tvc'),
      path.join(__dirname, '../../build/BurnedTokensHandler.abi.json'),
      { contractName: 'bth', keys: burnedTokensHandlerKeys }
    )
    await manager.contracts.bth.deployContract({
      _tip3RootAddress: manager.contracts.tip3root.address
    }).catch(e => {
      console.log(e)
    })
    // deploy relayers
    await manager.contracts.r1.deployContract({
      _accessControllerAddress: manager.contracts.ac.address,
      _myPublicKey: '0x' + firstRelayerKeys.public,
      _myInitState: fs.readFileSync(path.join(__dirname, '../../build/Relayer.tvc'), { encoding: 'base64' }),
      _bridgeAddress: manager.contracts.b.address
    })
    await manager.contracts.r2.deployContract({
      _accessControllerAddress: manager.contracts.ac.address,
      _myPublicKey: '0x' + secondRelayerKeys.public,
      _myInitState: fs.readFileSync(path.join(__dirname, '../../build/Relayer.tvc'), { encoding: 'base64' }),
      _bridgeAddress: manager.contracts.b.address
    })
    // create a superadmin (1 relayer)
    await manager.contracts.ac.runContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts.r1.address
    }, accessControllerKeys)
    // grant admin to second relayer
    await manager.contracts.r1.runContract(
      'grantRole',
      { role: '0x2', targetAddress: manager.contracts.r2.address },
      firstRelayerKeys
    )
    // set deployed handler for test message type
    await manager.contracts.r2.runContract(
      'bridgeSetHandler',
      { messageType: toHex('msg'), handlerAddress: manager.contracts.h.address },
      secondRelayerKeys
    )
    await manager.contracts.r2.runContract(
      'bridgeSetHandler',
      { messageType: toHex('tip3'), handlerAddress: manager.contracts.th.address },
      secondRelayerKeys
    )
    console.log('==== DEPLOY INFO ====')
    for (const [key, value] of Object.entries(manager.contracts)) {
      if (key !== 'Proposal' && key !== 'TONTokenWallet') {
        console.log(key, { keys: value.keys, address: value.address })
      }
    }
    console.log('=====================')
    return manager
  }

  it('allin: positive for relayers dot-ton', async function () {
    const manager = await deployAndPrepareBridgeComponents()
    // calculate encoded granting tip3 message body as a data
    const runBody = await manager.client.contracts.createRunBody({
      abi: manager.contracts.tip3root.contractPackage.abi,
      function: 'mint',
      params: {
        to: manager.contracts.tip3w.address,
        tokens: 1
      },
      internal: true
    })
    // old tip3 balance of destination
    const tokenBalanceBefore = (await manager.client.contracts.runLocal({
      address: manager.contracts.tip3w.address,
      functionName: 'getDetails',
      abi: manager.contracts.tip3w.contractPackage.abi,
      input: {}
    })).output.value0.balance
    // Proposal variables
    const chainId = 12
    const nonce = 1
    const data = runBody.bodyBase64
    // First vote is for creating a Proposal smart contract
    const beforeAccountsCount = await manager.client.queries.getAccountsCount()
    await manager.contracts.r1.runContract(
      'voteThroughBridge',
      { choice: 1, chainId: chainId, messageType: toHex('tip3'), nonce: nonce, data: data },
      manager.contracts.r1.keys
    )
    const afterAccountsCount = await manager.client.queries.getAccountsCount()
    assert.equal(beforeAccountsCount, afterAccountsCount - 1)
    // we need to save address for future getters run
    const proposalAddress = (await manager.contracts.bvc.runLocal(
      'getProposalAddress',
      { chainId, nonce: nonce, data: data }
    )).output.proposal
    console.log('Proposal Address: ', proposalAddress)
    // next vote is only vote (with no contract deployment)
    await new Promise(resolve => setTimeout(resolve, 1000))
    await manager.contracts.r2.runContract(
      'voteThroughBridge',
      { choice: 1, chainId: chainId, messageType: toHex('tip3'), nonce: nonce, data: data },
      manager.contracts.r2.keys
    )
    assert.equal(afterAccountsCount, await manager.client.queries.getAccountsCount())
    // Proposal results checking
    await new Promise(resolve => setTimeout(resolve, 5000))
    const proposalYesVotes = (await manager.client.contracts.runLocal({
      address: proposalAddress,
      functionName: 'getYesVotes',
      abi: manager.contracts.Proposal.contractPackage.abi,
      input: {}
    })).output.yesVotes
    assert.equal(2, parseInt(proposalYesVotes, 16))
    // assert.equal(1, parseInt(proposalYesVotes, 16))
    await new Promise(resolve => setTimeout(resolve, 5000))
    const tokenBalanceAfter = (await manager.client.contracts.runLocal({
      address: manager.contracts.tip3w.address,
      functionName: 'getDetails',
      abi: manager.contracts.tip3w.contractPackage.abi,
      input: {}
    })).output.value0.balance
    assert.equal(parseInt(tokenBalanceBefore, 16) + 1, parseInt(tokenBalanceAfter, 16))
  })

  it.only('allin: positive for relayers ton-dot', async function () {
    const manager = await deployAndPrepareBridgeComponents(false)
    const payloadParams = {
      destinationChainID: '0x1',
      resourceID: toHex('test'),
      depositNonce: '0x1',
      amount: '0x1',
      recipient: toHex('addressp')
    }
    const data = await manager.client.contracts.createRunBody({
      abi: manager.contracts.bth.contractPackage.abi,
      function: 'deposit',
      params: payloadParams,
      internal: true
    })
    const testWalletKeys = await manager.createKeysAndReturn()
    await manager.contracts.tip3root.runContract(
      'deployWallet',
      { tokens: 100, grams: 1000000000, wallet_public_key_: '0x' + testWalletKeys.public, owner_address_: zeroAddress, gas_back_address: manager.contracts.tip3root.address },
      manager.contracts.tip3root.keys
    )
    const testWalletAddress = (await manager.client.contracts.runLocal({
      address: manager.contracts.tip3root.address,
      functionName: 'getWalletAddress',
      abi: manager.contracts.tip3root.contractPackage.abi,
      input: { wallet_public_key_: '0x' + testWalletKeys.public, owner_address_: zeroAddress }
    })).output.value0
    console.log('testWalletAddress: ', testWalletAddress)
    await manager.client.contracts.run({
      address: testWalletAddress,
      abi: manager.contracts.tip3w.contractPackage.abi,
      functionName: 'burnByOwner',
      input: {
        tokens: 10,
        grams: 100000000,
        callback_address: manager.contracts.bth.address,
        callback_payload: data.bodyBase64
      },
      keyPair: testWalletKeys
    })
    await new Promise(resolve => setTimeout(resolve, 3000))
    const handlerOutbound = await manager.client.queries.messages.query({
      filter: {
        src: { eq: manager.contracts.bth.address },
        dst: { eq: '' }
      },
      result: 'body',
      limit: 1
    })
    const bodyForCheck = handlerOutbound[0].body
    const decodedBody = await manager.client.contracts.decodeOutputMessageBody({
      abi: manager.contracts.bth.contractPackage.abi,
      bodyBase64: bodyForCheck,
      internal: true
    })
    assert.equal(payloadParams.amount, decodedBody.output.amount)
    assert.equal(payloadParams.depositNonce, decodedBody.output.depositNonce)
    assert.equal(payloadParams.destinationChainID, decodedBody.output.destinationChainID)
    assert.equal(payloadParams.recipient, decodedBody.output.recipient)
    assert.equal(payloadParams.resourceID, decodedBody.output.resourceID)
  })
})
