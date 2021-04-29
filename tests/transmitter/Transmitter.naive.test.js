const path = require('path')
const assert = require('assert')
const toHex = require('../helper').toHex
const fs = require('fs')

describe('VoteController', function () {
  const manager = new Manager()
  let senderKeys
  let receiverKeys

  before(async function () {
    await manager.createClient(['http://localhost:80/graphql'])
    senderKeys = await manager.createKeysAndReturn()
    console.log('senderKeys', senderKeys)
    receiverKeys = await manager.createKeysAndReturn()
    console.log('receiverKeys', receiverKeys)
    await manager.loadContract(
      path.join(__dirname, '../../build/Sender.tvc'),
      path.join(__dirname, '../../build/Sender.abi.json'),
      { contractName: 's', keys: senderKeys }
    )
    await manager.loadContract(
      path.join(__dirname, '../../build/Receiver.tvc'),
      path.join(__dirname, '../../build/Receiver.abi.json'),
      { contractName: 'r', keys: receiverKeys }
    )

    // FOR DEPLOY
    /*
    await manager.addContractFromAddress(
      '0:440c99337a4009fec7ad4895a08587f05ab98b9d5c341dfb2211d1c862f1ae78',
      path.join(__dirname, '../../CustomGiverForDevNet/WintexGiver.abi.json'),
      'WintexGiver'
    )
    const wintexGiverKeysObject = JSON.parse(fs.readFileSync(path.join(__dirname, '../../CustomGiverForDevNet/WintexGiver.keys.json')))
    await manager.contracts['WintexGiver'].runContract('sendMeGramsPls', { dest: manager.contracts.r.address, amount: 1000000000 }, wintexGiverKeysObject)
    await new Promise(resolve => setTimeout(resolve, 10000))
    await manager.contracts['WintexGiver'].runContract('sendMeGramsPls', { dest: manager.contracts.s.address, amount: 1000000000 }, wintexGiverKeysObject)
    await new Promise(resolve => setTimeout(resolve, 10000))
    */

    await manager.contracts.s.deployContract({}, true, senderKeys)
    await manager.contracts.r.deployContract({}, true, receiverKeys)
    console.log('r', manager.contracts.r.address)
    console.log('s', manager.contracts.s.address)
  })

  it('sender should send some messages for receiver', async function () {
    await manager.contracts.s.runContract('sendData', {
      destination: manager.contracts.r.address,
      bounce: true,
      data: toHex('Hello World'),
      value: 200000000,
      destinationChainId: 1
    }, senderKeys).catch(e => console.log(e))
    await manager.contracts.s.runContract('sendData', {
      destination: manager.contracts.r.address,
      bounce: true,
      data: toHex('Hello World 2'),
      value: 200000000,
      destinationChainId: 1
    }, senderKeys).catch(e => console.log(e))
    await manager.contracts.s.runContract('sendData', {
      destination: manager.contracts.r.address,
      bounce: true,
      data: toHex('Hello World 2'),
      value: 200000000,
      destinationChainId: 2
    }, senderKeys).catch(e => console.log(e))
    const firstMessage = (await manager.contracts.r.runLocal('getNonceByChainId', { destinationChainId: 1 })).output.nonce
    const secondMessage = (await manager.contracts.r.runLocal('getNonceByChainId', { destinationChainId: 2 })).output.nonce
    assert.equal(2, parseInt(firstMessage, 16))
    assert.equal(1, parseInt(secondMessage, 16))
  })
})
