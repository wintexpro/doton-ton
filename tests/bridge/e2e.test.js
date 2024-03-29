const assert = require('assert')
const fs = require('fs')
const path = require('path')
const toHex = require('../helper').toHex
const crypto = require('crypto')
const EdDSA = require('elliptic').eddsa

describe('Bridge.e2e', function () {
  const zeroAddress = '0:0000000000000000000000000000000000000000000000000000000000000000'
  before(async function () {
    console.log('Start..')
    // await restart() // recreate and start containers
    await new Promise(resolve => setTimeout(resolve, 5000))
  })

  async function deployAndPrepareBridgeComponents (firstEraDuration, secondEraDuration, votersAmount = 2, isOwnerOfT3RootInternal = true) {
    const manager = new Manager()
    await manager.createClient(['http://localhost:80/graphql'])
    // load proposal and epoch only for getting CODE for deploy another components
    await manager.loadContract(
      path.join(__dirname, '../../build/Proposal.tvc'),
      path.join(__dirname, '../../build/Proposal.abi.json')
    )
    await manager.loadContract(
      path.join(__dirname, '../../build/Epoch.tvc'),
      path.join(__dirname, '../../build/Epoch.abi.json')
    )
    // load and deploy storagefee
    const feeStorageKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/FeeStorage.tvc'),
      path.join(__dirname, '../../build/FeeStorage.abi.json'),
      { contractName: 'fee', keys: feeStorageKeys }
    )
    await manager.contracts.fee.deployContract({
      _relayerInitState: fs.readFileSync(path.join(__dirname, '../../build/Relayer.tvc'), { encoding: 'base64' })
    })
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
    const epochControllerKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/EpochController.tvc'),
      path.join(__dirname, '../../build/EpochController.abi.json'),
      { contractName: 'bvc', keys: epochControllerKeys }
    )
    await manager.contracts.bvc.deployContract({
      _proposalCode: (await manager.client.contracts.getCodeFromImage({ imageBase64: manager.contracts.Proposal.contractPackage.imageBase64 })).codeBase64,
      _epochCode: (await manager.client.contracts.getCodeFromImage({ imageBase64: manager.contracts.Epoch.contractPackage.imageBase64 })).codeBase64,
      _deployInitialValue: 2000000000,
      _publicKey: '0x' + epochControllerKeys.public,
      _proposalVotersAmount: votersAmount,
      _bridgeAddress: await manager.contracts.b.futureAddress(),
      _firstEraDuration: firstEraDuration,
      _secondEraDuration: secondEraDuration
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
      _epochControllerPubKey: '0x' + epochControllerKeys.public
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
    await manager.contracts.tip3root.complicatedDeploy({
      root_public_key_: isOwnerOfT3RootInternal ? 0 : '0x' + tip3RootKeys.public,
      root_owner_address_: isOwnerOfT3RootInternal ? await manager.contracts.th.futureAddress() : zeroAddress
    }, {}, {
      _randomNonce: '0x' + crypto.createHash('sha256').update(crypto.randomBytes(32)).digest('hex'),
      wallet_code: (await manager.client.contracts.getCodeFromImage({ imageBase64: manager.contracts.tip3w.contractPackage.imageBase64 })).codeBase64,
      name: toHex('Test', false),
      symbol: toHex('TST', false),
      decimals: 0
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
      _epochControllerPubKey: '0x' + epochControllerKeys.public,
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

  it('e2e: FeeStorage workarounds (positive simple)', async function () {
    const manager = await deployAndPrepareBridgeComponents(1, 60, 1)
    const testValue = 40
    await manager.contracts.r1.runContract(
      'storageSetFee',
      {
        feeStorageAddress: manager.contracts.fee.address,
        shaMethod: '0x' + crypto.createHash('sha256').update('test1').digest('hex'),
        value: testValue
      },
      manager.contracts.r1.keys
    )
    const testPrice = 21
    const estimateFeeResult = (await manager.client.contracts.runLocal({
      address: manager.contracts.fee.address,
      functionName: 'estimateFee',
      abi: manager.contracts.fee.contractPackage.abi,
      input: {
        shaMethod: '0x' + crypto.createHash('sha256').update('test1').digest('hex'),
        price: testPrice
      }
    })).output.value0
    assert.equal(parseInt(estimateFeeResult), testPrice * testValue)
  })

  it('e2e: FeeStorage workarounds (negative simple)', async function () {
    const manager = await deployAndPrepareBridgeComponents(1, 60, 1)
    const testPrice = 21
    // must be an error
    let error
    await manager.client.contracts.runLocal({
      address: manager.contracts.fee.address,
      functionName: 'estimateFee',
      abi: manager.contracts.fee.contractPackage.abi,
      input: {
        shaMethod: '0x' + crypto.createHash('sha256').update('test1').digest('hex'),
        price: testPrice
      }
    }).catch(e => { error = e })
    assert.notEqual(error.message.search('code 102'), -1)
  })

  it('e2e: DOT-TON 1 VOTE (silly)', async function () {
    const manager = await deployAndPrepareBridgeComponents(1, 60, 1)
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
    const epochAddress = (await manager.contracts.bvc.runLocal(
      'getEpochAddress',
      { number: 1 }
    )).output.epoch
    const publicRandomness = (await manager.contracts.bvc.runLocal(
      'publicRandomness',
      { }
    )).output.publicRandomness
    console.log('Epoch Address: ', epochAddress)
    console.log('Public Randomness: ', publicRandomness)
    const ec = new EdDSA('ed25519')
    const key1 = ec.keyFromSecret(crypto.randomBytes(32))
    const signature1 = key1.sign(publicRandomness.substr(2)).toHex()
    // first era of this test for 1 ms. so signup must execute new epoch deployment
    const beforeSignUpAccountsCount = await manager.client.queries.getAccountsCount()
    await manager.contracts.r1.runContract(
      'signUpForEpoch',
      {
        epochAddress,
        signHighPart: '0x' + signature1.substr(0, 64),
        signLowPart: '0x' + signature1.substr(64, 128),
        pubkey: '0x' + key1.getPublic('hex')
      },
      manager.contracts.r1.keys
    )
    await new Promise(resolve => setTimeout(resolve, 1000))
    const afterSignUpAccountsCount = await manager.client.queries.getAccountsCount()
    assert.equal(beforeSignUpAccountsCount, afterSignUpAccountsCount - 1)
    const newPublicRandomness = (await manager.contracts.bvc.runLocal(
      'publicRandomness',
      { }
    )).output.publicRandomness
    assert.notEqual(publicRandomness, newPublicRandomness)
    // vote with proposal contract deployment
    const beforeVoteAccountsCount = await manager.client.queries.getAccountsCount()
    await manager.contracts.r1.runContract(
      'voteThroughBridge',
      { epochNumber: 1, choice: 1, chainId: chainId, messageType: toHex('tip3'), nonce: nonce, data: data },
      manager.contracts.r1.keys
    )
    const afterVoteAccountsCount = await manager.client.queries.getAccountsCount()
    assert.equal(beforeVoteAccountsCount, afterVoteAccountsCount - 1)
    const proposalAddress = (await manager.client.contracts.runLocal({
      address: epochAddress,
      functionName: 'getProposalAddress',
      abi: manager.contracts.Epoch.contractPackage.abi,
      input: {
        chainId, nonce: nonce, data: data
      }
    })).output.proposal
    console.log('Proposal Address: ', proposalAddress)
    await new Promise(resolve => setTimeout(resolve, 5000))
    const proposalYesVotes = (await manager.client.contracts.runLocal({
      address: proposalAddress,
      functionName: 'getYesVotes',
      abi: manager.contracts.Proposal.contractPackage.abi,
      input: {}
    })).output.yesVotes
    assert.equal(1, parseInt(proposalYesVotes, 16))
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

  it('e2e: TON-DOT 2 VOTE (full)', async function () {
    const manager = await deployAndPrepareBridgeComponents(1, 1, 2, false)
    const payloadParams = {
      destinationChainID: '0x1',
      resourceID: toHex('test'),
      depositNonce: '0x1',
      amount: 10,
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
    console.log('Test Wallet Address: ', testWalletAddress)
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
    assert.notEqual(handlerOutbound[0], undefined)
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

  it('e2e: DOT-TON complicated (2 relayers, 2 votes, eras and epoch changing checking) ', async function () {
    // WARNING!
    // It's very complicate to pass timings :)
    // I don't know if you can pass it with your PC
    const manager = await deployAndPrepareBridgeComponents(30, 10, 2)
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
    // Proposal variables
    const chainId = 12
    const nonce = 1
    const data = runBody.bodyBase64
    // First vote is for creating a Proposal smart contract
    const epochAddress = (await manager.contracts.bvc.runLocal(
      'getEpochAddress',
      { number: 1 }
    )).output.epoch
    const publicRandomness = (await manager.contracts.bvc.runLocal(
      'publicRandomness',
      { }
    )).output.publicRandomness
    console.log('Epoch Address: ', epochAddress)
    console.log('Public Randomness: ', publicRandomness)
    const ec = new EdDSA('ed25519')
    const key1 = ec.keyFromSecret(crypto.randomBytes(32))
    const signature1 = key1.sign(publicRandomness.substr(2)).toHex()
    await manager.contracts.r1.runContract(
      'signUpForEpoch',
      {
        epochAddress,
        signHighPart: '0x' + signature1.substr(0, 64),
        signLowPart: '0x' + signature1.substr(64, 128),
        pubkey: '0x' + key1.getPublic('hex')
      },
      manager.contracts.r1.keys
    )
    const key2 = ec.keyFromSecret(crypto.randomBytes(32))
    const signature2 = key2.sign(publicRandomness.substr(2)).toHex()
    // we need to wait until can force
    const secondSignupTime = (await manager.client.contracts.runLocal({
      address: epochAddress,
      functionName: 'firstEraEndsAt',
      abi: manager.contracts.Epoch.contractPackage.abi,
      input: {}
    })).output.firstEraEndsAt
    while (Date.now() / 1000 < parseInt(secondSignupTime)) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    await manager.contracts.r2.runContract(
      'signUpForEpoch',
      {
        epochAddress,
        signHighPart: '0x' + signature2.substr(0, 64),
        signLowPart: '0x' + signature2.substr(64, 128),
        pubkey: '0x' + key2.getPublic('hex')
      },
      manager.contracts.r2.keys
    )
    // vote with proposal contract deployment
    await manager.contracts.r1.runContract(
      'voteThroughBridge',
      { epochNumber: 1, choice: 1, chainId: chainId, messageType: toHex('tip3'), nonce: nonce, data: data },
      manager.contracts.r1.keys
    )
    await new Promise(resolve => setTimeout(resolve, 10000))
    // bad vote! this vote with another nonce - so it should create proposal, but epoch ends!
    await manager.contracts.r2.runContract(
      'voteThroughBridge',
      { epochNumber: 1, choice: 1, chainId: chainId, messageType: toHex('tip3'), nonce: nonce + 1, data: data },
      manager.contracts.r2.keys
    )
    await new Promise(resolve => setTimeout(resolve, 1000))
    // this proposal shouldn't exists
    const badProposalAddress = (await manager.client.contracts.runLocal({
      address: epochAddress,
      functionName: 'getProposalAddress',
      abi: manager.contracts.Epoch.contractPackage.abi,
      input: {
        chainId, nonce: nonce + 1, data: data
      }
    })).output.proposal
    const badProposalChecking = await manager.client.queries.accounts.query({
      filter: {
        id: { eq: badProposalAddress }
      },
      result: 'balance'
    })
    assert.equal(badProposalChecking.length, 0)
    // and just check for failed vote calling. ONLY 3 messages from epoch: first vote creation+vote (one failed by design) and new epoch message
    const epochOutboundForBadProposal = await manager.client.queries.messages.query({
      filter: {
        src: { eq: epochAddress },
        dst: { eq: badProposalAddress }
      },
      result: 'body dst_transaction { end_status_name }'
    })
    assert.equal(epochOutboundForBadProposal[0].dst_transaction.end_status_name, 'NonExist')
    // BUT epoch should allow vote for already created proposal of ended era!
    await manager.contracts.r2.runContract(
      'voteThroughBridge',
      { epochNumber: 1, choice: 1, chainId: chainId, messageType: toHex('tip3'), nonce: nonce, data: data },
      manager.contracts.r2.keys
    )
    const proposalAddress = (await manager.client.contracts.runLocal({
      address: epochAddress,
      functionName: 'getProposalAddress',
      abi: manager.contracts.Epoch.contractPackage.abi,
      input: {
        chainId, nonce: nonce, data: data
      }
    })).output.proposal
    const epochOutboundForGoodProposal = await manager.client.queries.messages.query({
      filter: {
        src: { eq: epochAddress },
        dst: { eq: proposalAddress }
      },
      result: 'body'
    })
    // 2 + 1 (creation+vote from r1 and vote from r2)
    assert.equal(epochOutboundForGoodProposal.length, 3)
    // just another check that proposal called handler
    const proposalOutbound = await manager.client.queries.messages.query({
      filter: {
        src: { eq: proposalAddress },
        dst: { eq: manager.contracts.th.address }
      },
      result: 'dst'
    })
    assert.equal(proposalOutbound.length, 1)
    // Lets check existence of new deployed epoch
    const newEpochAddress = (await manager.contracts.bvc.runLocal(
      'getEpochAddress',
      { number: 2 }
    )).output.epoch
    console.log('New Epoch Address: ', newEpochAddress)
    const newEpochChecking = await manager.client.queries.accounts.query({
      filter: {
        id: { eq: newEpochAddress }
      },
      result: 'balance'
    })
    assert.equal(newEpochChecking.length, 1)
    // lets signup j4f :) but we should take and sign new public randomness!
    const newPublicRandomness = (await manager.contracts.bvc.runLocal(
      'publicRandomness',
      { }
    )).output.publicRandomness
    console.log('New Public Randomness: ', newPublicRandomness)
    const key3 = ec.keyFromSecret(crypto.randomBytes(32))
    const signature3 = key3.sign(newPublicRandomness.substr(2)).toHex()
    await manager.contracts.r2.runContract(
      'signUpForEpoch',
      {
        epochAddress: newEpochAddress,
        signHighPart: '0x' + signature3.substr(0, 64),
        signLowPart: '0x' + signature3.substr(64, 128),
        pubkey: '0x' + key3.getPublic('hex')
      },
      manager.contracts.r2.keys
    )
    const eraRigistrationMessage = await manager.client.queries.messages.query({
      filter: {
        src: { eq: manager.contracts.r2.address },
        dst: { eq: newEpochAddress }
      },
      result: 'body dst_transaction { compute { success } }'
    })
    assert.equal(eraRigistrationMessage[0].dst_transaction.compute.success, true)
  })

  it('e2e: DOT-TON, attempt to exceed the maximum number of relayers', async function () {
    const manager = await deployAndPrepareBridgeComponents(30, 10, 2)
    // create and deploy 3 more relayers
    const thirdRelayerKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/Relayer.tvc'),
      path.join(__dirname, '../../build/Relayer.abi.json'),
      { contractName: 'r3', keys: thirdRelayerKeys }
    )
    const fourthRelayerKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/Relayer.tvc'),
      path.join(__dirname, '../../build/Relayer.abi.json'),
      { contractName: 'r4', keys: fourthRelayerKeys }
    )
    const fifthRelayerKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/Relayer.tvc'),
      path.join(__dirname, '../../build/Relayer.abi.json'),
      { contractName: 'r5', keys: fifthRelayerKeys }
    )
    await manager.contracts.r3.deployContract({
      _accessControllerAddress: manager.contracts.ac.address,
      _myPublicKey: '0x' + thirdRelayerKeys.public,
      _myInitState: fs.readFileSync(path.join(__dirname, '../../build/Relayer.tvc'), { encoding: 'base64' }),
      _bridgeAddress: manager.contracts.b.address
    })
    await manager.contracts.r4.deployContract({
      _accessControllerAddress: manager.contracts.ac.address,
      _myPublicKey: '0x' + fourthRelayerKeys.public,
      _myInitState: fs.readFileSync(path.join(__dirname, '../../build/Relayer.tvc'), { encoding: 'base64' }),
      _bridgeAddress: manager.contracts.b.address
    })
    await manager.contracts.r5.deployContract({
      _accessControllerAddress: manager.contracts.ac.address,
      _myPublicKey: '0x' + fifthRelayerKeys.public,
      _myInitState: fs.readFileSync(path.join(__dirname, '../../build/Relayer.tvc'), { encoding: 'base64' }),
      _bridgeAddress: manager.contracts.b.address
    })
    // =============== call signUpForEpoch by each relayer
    const epochAddress = (await manager.contracts.bvc.runLocal(
      'getEpochAddress',
      { number: 1 }
    )).output.epoch
    const publicRandomness = (await manager.contracts.bvc.runLocal(
      'publicRandomness',
      { }
    )).output.publicRandomness
    console.log('Epoch Address: ', epochAddress)
    console.log('Public Randomness: ', publicRandomness)

    await signUpForEpoch(manager, 'r1', epochAddress, publicRandomness)
    await signUpForEpoch(manager, 'r2', epochAddress, publicRandomness)
    await signUpForEpoch(manager, 'r3', epochAddress, publicRandomness)
    await signUpForEpoch(manager, 'r4', epochAddress, publicRandomness)
    await signUpForEpoch(manager, 'r5', epochAddress, publicRandomness)
    // we need to wait until can force
    const secondSignupTime = (await manager.client.contracts.runLocal({
      address: epochAddress,
      functionName: 'firstEraEndsAt',
      abi: manager.contracts.Epoch.contractPackage.abi,
      input: {}
    })).output.firstEraEndsAt
    await new Promise(resolve => setTimeout(resolve, parseInt(secondSignupTime) * 1000 - Date.now() + 1000))
    // насколько я понял, чтобы принялись предыдущие signup-ы, нужно после времени окончания первой эры вызвать любой signup, чтобы "двинуть" эру
    await signUpForEpoch(manager, 'r1', epochAddress, publicRandomness)
    // call method 'isChosen' by each relayer
    const isRelayer1Chosen = await isRelayerChoosen(manager, 'r1', epochAddress)
    const isRelayer2Chosen = await isRelayerChoosen(manager, 'r2', epochAddress)
    const isRelayer3Chosen = await isRelayerChoosen(manager, 'r3', epochAddress)
    const isRelayer4Chosen = await isRelayerChoosen(manager, 'r4', epochAddress)
    const isRelayer5Chosen = await isRelayerChoosen(manager, 'r5', epochAddress)

    // check that only 3 of 5 relayers was chosen
    let relayersChosen = 0
    let relayersNotChosen = 0
    Array.from([
      isRelayer1Chosen.output.value0,
      isRelayer2Chosen.output.value0,
      isRelayer3Chosen.output.value0,
      isRelayer4Chosen.output.value0,
      isRelayer5Chosen.output.value0
    ]).forEach(el => el ? relayersChosen++ : relayersNotChosen++)
    assert.equal(relayersChosen, 3)
    assert.equal(relayersNotChosen, 2)
  })

  it('e2e: DOT-TON, attempt to signup with invalid data (should throw error)', async function () {
    const manager = await deployAndPrepareBridgeComponents(30, 10, 2)

    const epochAddress = (await manager.contracts.bvc.runLocal(
      'getEpochAddress',
      { number: 1 }
    )).output.epoch
    const publicRandomness = (await manager.contracts.bvc.runLocal(
      'publicRandomness',
      { }
    )).output.publicRandomness
    console.log('Epoch Address: ', epochAddress)
    console.log('Public Randomness: ', publicRandomness)

    const ec = new EdDSA('ed25519')
    const key1 = ec.keyFromSecret(crypto.randomBytes(32))
    const signature1 = key1.sign(publicRandomness.substr(2)).toHex()
    const key2 = ec.keyFromSecret(crypto.randomBytes(32))
    const signature2 = key2.sign(publicRandomness.substr(2)).toHex()
    await manager.contracts.r1.runContract(
      'signUpForEpoch',
      {
        epochAddress,
        signHighPart: '0x' + signature2.substr(0, 64),
        signLowPart: '0x' + signature1.substr(64, 128),
        pubkey: '0x' + key1.getPublic('hex')
      },
      manager.contracts.r1.keys
    )
    const eraRigistrationMessage = await manager.client.queries.messages.query({
      filter: {
        src: { eq: manager.contracts.r1.address },
        dst: { eq: epochAddress }
      },
      result: 'body dst_transaction { end_status_name compute { success, exit_code } }'
    })
    assert.equal(eraRigistrationMessage[0].dst_transaction.compute.success, false)
    assert.equal(eraRigistrationMessage[0].dst_transaction.compute.exit_code, 101)
  })

  it('e2e: DOT-TON, attempt to vote before first era ending (should throw error)', async function () {
    const manager = await deployAndPrepareBridgeComponents(30, 10, 2)

    const epochAddress = (await manager.contracts.bvc.runLocal(
      'getEpochAddress',
      { number: 1 }
    )).output.epoch
    const publicRandomness = (await manager.contracts.bvc.runLocal(
      'publicRandomness',
      { }
    )).output.publicRandomness
    console.log('Epoch Address: ', epochAddress)
    console.log('Public Randomness: ', publicRandomness)

    await signUpForEpoch(manager, 'r1', epochAddress, publicRandomness)

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
    // Proposal variables
    const chainId = 12
    const nonce = 1
    const data = runBody.bodyBase64
    // vote with proposal contract deployment
    await manager.contracts.r1.runContract(
      'voteThroughBridge',
      { epochNumber: 1, choice: 1, chainId: chainId, messageType: toHex('tip3'), nonce: nonce, data: data },
      manager.contracts.r1.keys
    )
    await new Promise(resolve => setTimeout(resolve, 1000))

    await signUpForEpoch(manager, 'r1', epochAddress, publicRandomness)
    await new Promise(resolve => setTimeout(resolve, 10000))

    const epochOutboundForBadProposal = await manager.client.queries.messages.query({
      filter: {
        src: { eq: manager.contracts.bvc.address },
        dst: { eq: epochAddress }
      },
      result: 'body dst_transaction { compute { success, exit_code } }'
    })
    assert.equal(epochOutboundForBadProposal.length, 2)
    assert.equal(Boolean(epochOutboundForBadProposal.find(res => res.dst_transaction?.compute?.success === true)), true)
    assert.equal(
      Boolean(epochOutboundForBadProposal.find(
        res => res.dst_transaction?.compute?.success === false && res.dst_transaction?.compute?.exit_code === 106
      )),
      true
    )
  })

  it('e2e: DOT-TON, attempt to signup after first era ending (should throw error)', async function () {
    const manager = await deployAndPrepareBridgeComponents(30, 10, 2)
    // create and deploy 3 more relayers
    const thirdRelayerKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/Relayer.tvc'),
      path.join(__dirname, '../../build/Relayer.abi.json'),
      { contractName: 'r3', keys: thirdRelayerKeys }
    )
    const fourthRelayerKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../build/Relayer.tvc'),
      path.join(__dirname, '../../build/Relayer.abi.json'),
      { contractName: 'r4', keys: fourthRelayerKeys }
    )
    await manager.contracts.r3.deployContract({
      _accessControllerAddress: manager.contracts.ac.address,
      _myPublicKey: '0x' + thirdRelayerKeys.public,
      _myInitState: fs.readFileSync(path.join(__dirname, '../../build/Relayer.tvc'), { encoding: 'base64' }),
      _bridgeAddress: manager.contracts.b.address
    })
    await manager.contracts.r4.deployContract({
      _accessControllerAddress: manager.contracts.ac.address,
      _myPublicKey: '0x' + fourthRelayerKeys.public,
      _myInitState: fs.readFileSync(path.join(__dirname, '../../build/Relayer.tvc'), { encoding: 'base64' }),
      _bridgeAddress: manager.contracts.b.address
    })
    // =============== call signUpForEpoch by each relayer
    const epochAddress = (await manager.contracts.bvc.runLocal(
      'getEpochAddress',
      { number: 1 }
    )).output.epoch
    const publicRandomness = (await manager.contracts.bvc.runLocal(
      'publicRandomness',
      { }
    )).output.publicRandomness
    console.log('Epoch Address: ', epochAddress)
    console.log('Public Randomness: ', publicRandomness)

    await signUpForEpoch(manager, 'r1', epochAddress, publicRandomness)
    await signUpForEpoch(manager, 'r2', epochAddress, publicRandomness)
    // we need to wait until can force
    const secondSignupTime = (await manager.client.contracts.runLocal({
      address: epochAddress,
      functionName: 'firstEraEndsAt',
      abi: manager.contracts.Epoch.contractPackage.abi,
      input: {}
    })).output.firstEraEndsAt
    await new Promise(resolve => setTimeout(resolve, parseInt(secondSignupTime) * 1000 - Date.now() + 1000))
    await signUpForEpoch(manager, 'r3', epochAddress, publicRandomness)
    await new Promise(resolve => setTimeout(resolve, 1000))
    // fourth relayer should not signup
    await signUpForEpoch(manager, 'r4', epochAddress, publicRandomness)

    const eraRigistrationMessage = await manager.client.queries.messages.query({
      filter: {
        src: { eq: manager.contracts.r4.address },
        dst: { eq: epochAddress }
      },
      result: 'body dst_transaction { compute { success, exit_code } }'
    })
    assert.equal(eraRigistrationMessage[0].dst_transaction.compute.success, false)
    assert.equal(eraRigistrationMessage[0].dst_transaction.compute.exit_code, 102)

    // method 'isChosen' for fourth relayer should return false
    const isRelayer4Chosen = await isRelayerChoosen(manager, 'r4', epochAddress)
    assert.equal(isRelayer4Chosen.output.value0, false)
  })

  it('e2e: DOT-TON, attempt to signup twice with same signature (should throw error)', async function () {
    const manager = await deployAndPrepareBridgeComponents(30, 10, 2)

    const epochAddress = (await manager.contracts.bvc.runLocal(
      'getEpochAddress',
      { number: 1 }
    )).output.epoch
    const publicRandomness = (await manager.contracts.bvc.runLocal(
      'publicRandomness',
      { }
    )).output.publicRandomness
    console.log('Epoch Address: ', epochAddress)
    console.log('Public Randomness: ', publicRandomness)
    await new Promise(resolve => setTimeout(resolve, 1000))

    const ec = new EdDSA('ed25519')
    const key1 = ec.keyFromSecret(crypto.randomBytes(32))
    const signature1 = key1.sign(publicRandomness.substr(2)).toHex()
    await manager.contracts.r1.runContract(
      'signUpForEpoch',
      {
        epochAddress,
        signHighPart: '0x' + signature1.substr(0, 64),
        signLowPart: '0x' + signature1.substr(64, 128),
        pubkey: '0x' + key1.getPublic('hex')
      },
      manager.contracts.r1.keys
    )
    // try again with same signature
    await manager.contracts.r1.runContract(
      'signUpForEpoch',
      {
        epochAddress,
        signHighPart: '0x' + signature1.substr(0, 64),
        signLowPart: '0x' + signature1.substr(64, 128),
        pubkey: '0x' + key1.getPublic('hex')
      },
      manager.contracts.r1.keys
    )
    await new Promise(resolve => setTimeout(resolve, 10000))

    const eraRigistrationMessages = await manager.client.queries.messages.query({
      filter: {
        src: { eq: manager.contracts.r1.address },
        dst: { eq: epochAddress }
      },
      result: 'body dst_transaction { compute { success, exit_code } }'
    })
    assert.equal(eraRigistrationMessages.length, 2)
    assert.equal(Boolean(eraRigistrationMessages.find(res => res.dst_transaction?.compute?.success === true)), true)
    assert.equal(
      Boolean(eraRigistrationMessages.find(
        res => res.dst_transaction?.compute?.success === false && res.dst_transaction?.compute?.exit_code === 103
      )),
      true
    )
  })

  it('e2e: DOT-TON, attempt to vote with invalid choice (should throw error)', async function () {
    const manager = await deployAndPrepareBridgeComponents(30, 10, 2)

    const epochAddress = (await manager.contracts.bvc.runLocal(
      'getEpochAddress',
      { number: 1 }
    )).output.epoch
    const publicRandomness = (await manager.contracts.bvc.runLocal(
      'publicRandomness',
      { }
    )).output.publicRandomness
    console.log('Epoch Address: ', epochAddress)
    console.log('Public Randomness: ', publicRandomness)

    await signUpForEpoch(manager, 'r1', epochAddress, publicRandomness)
    await signUpForEpoch(manager, 'r2', epochAddress, publicRandomness)
    // we need to wait until can force
    const secondSignupTime = (await manager.client.contracts.runLocal({
      address: epochAddress,
      functionName: 'firstEraEndsAt',
      abi: manager.contracts.Epoch.contractPackage.abi,
      input: {}
    })).output.firstEraEndsAt
    await new Promise(resolve => setTimeout(resolve, parseInt(secondSignupTime) * 1000 - Date.now() + 1000))
    const thirdRelayerKeys = await manager.createKeysAndReturn()
    // signup third relayer to end the registration era
    await manager.loadContract(
      path.join(__dirname, '../../build/Relayer.tvc'),
      path.join(__dirname, '../../build/Relayer.abi.json'),
      { contractName: 'r3', keys: thirdRelayerKeys }
    )
    await manager.contracts.r3.deployContract({
      _accessControllerAddress: manager.contracts.ac.address,
      _myPublicKey: '0x' + thirdRelayerKeys.public,
      _myInitState: fs.readFileSync(path.join(__dirname, '../../build/Relayer.tvc'), { encoding: 'base64' }),
      _bridgeAddress: manager.contracts.b.address
    })
    await signUpForEpoch(manager, 'r3', epochAddress, publicRandomness)
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
    // vote with INVALID choice
    let error
    await manager.contracts.r1.runContract(
      'voteThroughBridge',
      { epochNumber: 1, choice: 3, chainId: 12, messageType: toHex('tip3'), nonce: 1, data: runBody.bodyBase64 },
      manager.contracts.r1.keys
    ).catch(e => { error = e })
    assert.strictEqual(error !== undefined, true)
    assert.strictEqual(error.data.exit_code, 122)
  })

  it('e2e: DOT-TON, force era, success case', async function () {
    const manager = await deployAndPrepareBridgeComponents(30, 10, 2)

    const epochAddress = (await manager.contracts.bvc.runLocal(
      'getEpochAddress',
      { number: 1 }
    )).output.epoch
    const publicRandomness = (await manager.contracts.bvc.runLocal(
      'publicRandomness',
      { }
    )).output.publicRandomness
    console.log('Epoch Address: ', epochAddress)
    console.log('Public Randomness: ', publicRandomness)
    await new Promise(resolve => setTimeout(resolve, 1000))

    const ec = new EdDSA('ed25519')
    const key1 = ec.keyFromSecret(crypto.randomBytes(32))
    const signature1 = key1.sign(publicRandomness.substr(2)).toHex()
    await manager.contracts.r1.runContract(
      'signUpForEpoch',
      {
        epochAddress,
        signHighPart: '0x' + signature1.substr(0, 64),
        signLowPart: '0x' + signature1.substr(64, 128),
        pubkey: '0x' + key1.getPublic('hex')
      },
      manager.contracts.r1.keys
    )

    // success case
    await manager.contracts.r1.runContract(
      'forceEra',
      {
        epochAddress,
        signHighPart: '0x' + signature1.substr(0, 64),
        signLowPart: '0x' + signature1.substr(64, 128),
        pubkey: '0x' + key1.getPublic('hex')
      },
      manager.contracts.r1.keys
    )
    const r1ToEpochMessages = await manager.client.queries.messages.query({
      filter: {
        src: { eq: manager.contracts.r1.address },
        dst: { eq: epochAddress }
      },
      result: 'body dst_transaction { compute { success, exit_code } }'
    })
    assert.strictEqual(r1ToEpochMessages.length, 2)
    assert.strictEqual(r1ToEpochMessages[0].dst_transaction.compute.success, true)
    assert.strictEqual(r1ToEpochMessages[1].dst_transaction.compute.success, true)

    // TODO интересно, что createEpoch завершается с exit_code: -14 (Out of gas: the contract is either low on gas, or its limit is exceeded).
    // И не только здесь, а везде:
    // кейс "e2e: DOT-TON, attempt to signup after first era ending" возвращает так же
    // кейс "e2e: DOT-TON complicated (2 relayers, 2 votes, eras and epoch changing checking) " - так же (вставьте этот код в 421 строку)
    /* const epochOutboundForBadProposal = await manager.client.queries.messages.query({
      filter: {
        src: { eq: epochAddress },
        dst: { eq: manager.contracts.bvc.address }
      },
      result: 'body dst_transaction { compute { success, exit_code } }'
    })
    console.log('epochOutboundForBadProposal::', epochOutboundForBadProposal, epochOutboundForBadProposal[0], epochOutboundForBadProposal[1]); */
  })

  it('e2e: DOT-TON, force era, unsuccess cases', async function () {
    const manager = await deployAndPrepareBridgeComponents(30, 10, 2)

    const epochAddress = (await manager.contracts.bvc.runLocal(
      'getEpochAddress',
      { number: 1 }
    )).output.epoch
    const publicRandomness = (await manager.contracts.bvc.runLocal(
      'publicRandomness',
      { }
    )).output.publicRandomness
    console.log('Epoch Address: ', epochAddress)
    console.log('Public Randomness: ', publicRandomness)
    await new Promise(resolve => setTimeout(resolve, 1000))

    const ec = new EdDSA('ed25519')
    const key1 = ec.keyFromSecret(crypto.randomBytes(32))
    const signature1 = key1.sign(publicRandomness.substr(2)).toHex()
    await manager.contracts.r1.runContract(
      'signUpForEpoch',
      {
        epochAddress,
        signHighPart: '0x' + signature1.substr(0, 64),
        signLowPart: '0x' + signature1.substr(64, 128),
        pubkey: '0x' + key1.getPublic('hex')
      },
      manager.contracts.r1.keys
    )

    // bad cases:
    const key2 = ec.keyFromSecret(crypto.randomBytes(32))
    const signature2 = key2.sign(publicRandomness.substr(2)).toHex()
    // try again with invalid signature
    await manager.contracts.r1.runContract(
      'forceEra',
      {
        epochAddress,
        signHighPart: '0x' + signature2.substr(0, 64),
        signLowPart: '0x' + signature2.substr(64, 128),
        pubkey: '0x' + key1.getPublic('hex')
      },
      manager.contracts.r1.keys
    )
    const r1ToEpochMessages = await manager.client.queries.messages.query({
      filter: {
        src: { eq: manager.contracts.r1.address },
        dst: { eq: epochAddress }
      },
      result: 'body dst_transaction { compute { success, exit_code } }'
    })
    assert.strictEqual(r1ToEpochMessages[1].dst_transaction.compute.success, false)
    assert.strictEqual(r1ToEpochMessages[1].dst_transaction.compute.exit_code, 101)

    // try again with unregistred signature
    await manager.contracts.r2.runContract(
      'forceEra',
      {
        epochAddress,
        signHighPart: '0x' + signature2.substr(0, 64),
        signLowPart: '0x' + signature2.substr(64, 128),
        pubkey: '0x' + key2.getPublic('hex')
      },
      manager.contracts.r2.keys
    )
    const r2ToEpochMessages = await manager.client.queries.messages.query({
      filter: {
        src: { eq: manager.contracts.r2.address },
        dst: { eq: epochAddress }
      },
      result: 'body dst_transaction { compute { success, exit_code } }'
    })
    assert.strictEqual(r2ToEpochMessages[0].dst_transaction.compute.success, false)
    assert.strictEqual(r2ToEpochMessages[0].dst_transaction.compute.exit_code, 107)
  })

  // TODO move this functions in helper

  async function signUpForEpoch (manager, relayerContract, epochAddress, publicRandomness) {
    const ec = new EdDSA('ed25519')
    const key1 = ec.keyFromSecret(crypto.randomBytes(32))
    const signature1 = key1.sign(publicRandomness.substr(2)).toHex()
    await manager.contracts[relayerContract].runContract(
      'signUpForEpoch',
      {
        epochAddress,
        signHighPart: '0x' + signature1.substr(0, 64),
        signLowPart: '0x' + signature1.substr(64, 128),
        pubkey: '0x' + key1.getPublic('hex')
      },
      manager.contracts[relayerContract].keys
    )
  }

  async function isRelayerChoosen (manager, relayerContract, epochAddress) {
    return manager.client.contracts.runLocal({
      address: epochAddress,
      functionName: 'isChoosen',
      abi: manager.contracts.Epoch.contractPackage.abi,
      input: { relayer: manager.contracts[relayerContract].address }
    })
  }
})
