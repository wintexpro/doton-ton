const assert = require('assert')
const fs = require('fs')
const path = require('path')
const toHex = require('../helper').toHex

describe('Bridge. Some full and direct.', function () {
  before(async function () {
    console.log('Start..')
    // await restart() // recreate and start containers
    await new Promise(resolve => setTimeout(resolve, 5000))
  })

  async function deployAndPrepareBridgeComponents () {
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
      path.join(__dirname, '../../static/tip3/TONTokenWallet.tvc'),
      path.join(__dirname, '../../static/tip3/TONTokenWallet.abi.json'),
      { contractName: 'tip3w', keys: tip3WalletKeys }
    )
    // deploy tip3 root
    const tip3RootKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../static/tip3/RootTokenContract.tvc'),
      path.join(__dirname, '../../static/tip3/RootTokenContract.abi.json'),
      { contractName: 'tip3root', keys: tip3RootKeys }
    )
    await manager.contracts.tip3root.deployContractWithCustomHeaders({
      wallet_code: (await manager.client.contracts.getCodeFromImage({ imageBase64: manager.contracts.tip3w.contractPackage.imageBase64 })).codeBase64,
      name: toHex('Test', false),
      symbol: toHex('TST', false),
      decimals: 0,
      root_public_key: 0,
      total_supply: 1000,
      root_owner: '0x' + (await manager.contracts.th.futureAddress()).substr(2)
    }, { pubkey: tip3RootKeys.public })
    // deploy test tip3 wallet
    await manager.contracts.tip3w.deployContractWithCustomHeaders({
      name: toHex('Test', false),
      symbol: toHex('TST', false),
      decimals: 0,
      root_public_key: '0x' + tip3RootKeys.public,
      wallet_public_key: '0x' + tip3WalletKeys.public,
      root_address: manager.contracts.tip3root.address,
      code: (await manager.client.contracts.getCodeFromImage({ imageBase64: manager.contracts.tip3w.contractPackage.imageBase64 })).codeBase64
    }, { pubkey: tip3WalletKeys.public })
    // deploy tip3 handler
    await manager.contracts.th.deployContract({
      _proposalCode: (await manager.client.contracts.getCodeFromImage({ imageBase64: manager.contracts.Proposal.contractPackage.imageBase64 })).codeBase64,
      _bridgeVoteControllerAddress: manager.contracts.bvc.address,
      _bridgeVoteControllerPubKey: '0x' + bridgeVoteControllerKeys.public,
      _tip3RootAddress: manager.contracts.tip3root.address
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

  it('allin: positive for relayers', async function () {
    const manager = await deployAndPrepareBridgeComponents()
    // calculate encoded granting tip3 message body as a data
    const runBody = await manager.client.contracts.createRunBody({
      abi: manager.contracts.tip3root.contractPackage.abi,
      function: 'grant',
      params: {
        dest: manager.contracts.tip3w.address,
        tokens: 1,
        grams: 100000000
      },
      internal: true
    })
    // old tip3 balance of destination
    const tokenBalanceBefore = (await manager.client.contracts.runLocal({
      address: manager.contracts.tip3w.address,
      functionName: 'getBalance',
      abi: manager.contracts.tip3w.contractPackage.abi,
      input: {}
    })).output.value0
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
    await new Promise(resolve => setTimeout(resolve, 5000))
    const tokenBalanceAfter = (await manager.client.contracts.runLocal({
      address: manager.contracts.tip3w.address,
      functionName: 'getBalance',
      abi: manager.contracts.tip3w.contractPackage.abi,
      input: {}
    })).output.value0
    assert.equal(parseInt(tokenBalanceBefore, 16) + 1, parseInt(tokenBalanceAfter, 16))
  })
})
