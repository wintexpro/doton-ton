const path = require('path')
const assert = require('assert')
const toHex = require('../helper').toHex
const fromHexWith0x = require('../helper').fromHexWith0x

describe('VoteController', function () {
  const manager = new Manager()
  let senderKeys
  let receiverKeys

  before(async function () {
    await manager.createClient(['http://localhost:80/graphql'])
    senderKeys = await manager.createKeysAndReturn()
    receiverKeys = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../transmitter/Sender.tvc'),
      path.join(__dirname, '../../transmitter/Sender.abi.json'),
      { contractName: 's', keys: senderKeys }
    )
    await manager.loadContract(
      path.join(__dirname, '../../transmitter/Receiver.tvc'),
      path.join(__dirname, '../../transmitter/Receiver.abi.json'),
      { contractName: 'r', keys: receiverKeys }
    )
    await manager.contracts.s.deployContract({}, true, senderKeys)
    await manager.contracts.r.deployContract({}, true, receiverKeys)
  })

  it('sender should send some messages for receiver', async function () {
    await manager.contracts.s.runContract('sendData', {
      destination: manager.contracts.r.address,
      bounce: true,
      data: toHex('Hello World'),
      value: 200000000
    }, senderKeys).catch(e => console.log(e))
    await manager.contracts.s.runContract('sendData', {
      destination: manager.contracts.r.address,
      bounce: true,
      data: toHex('Hello World 2'),
      value: 200000000
    }, senderKeys).catch(e => console.log(e))
    const firstMessage = (await manager.contracts.r.runLocal('getMessageByNumber', { number: 0 })).output.message
    const secondMessage = (await manager.contracts.r.runLocal('getMessageByNumber', { number: 1 })).output.message
    assert.equal('Hello World', fromHexWith0x(firstMessage))
    assert.equal('Hello World 2', fromHexWith0x(secondMessage))
  })
})
