/* eslint-disable dot-notation */
/**
 * Tests: contract AccessCards.
 *
 * Run this tests from root directory: `ton-env test -p ./tests/rbac/<current file name>.test.js`
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')
/* const fromHexWith0x = require('../helper').fromHexWith0x
const toHex = require('../helper').toHex */

describe('Asserts', function () {
  let manager

  before(async function () {
    console.log('Start..')
    await restart() // recreate and start containers
  })

  beforeEach(async function () {
    manager = new Manager()
    await manager.CreateClient(['http://localhost:80/graphql'])
    await manager.createKeys()

    manager.loadContract(
      path.join(__dirname, '../../onBounceHandler/MyContract.tvc'),
      path.join(__dirname, '../../onBounceHandler/MyContract.abi.json')
    )
    await manager.contracts['MyContract'].DeployContract({})
    await manager.GiveToAddress(manager.contracts['MyContract'].address)
  })

  it.only('Test - should execute onBound', async function () {
    // Deplyment the AnotherContract
    manager.loadContract(
      path.join(__dirname, '../../onBounceHandler/AnotherContract.tvc'),
      path.join(__dirname, '../../onBounceHandler/AnotherContract.abi.json')
    )
    const keysForAnotherContract = await manager.createKeysAndReturn()
    await manager.contracts['AnotherContract'].DeployContract({}, keysForAnotherContract)
    await manager.GiveToAddress(manager.contracts['AnotherContract'].address)

    // --- Try send values ---
    await manager.contracts['MyContract'].RunContract('sendValues', {
      dest: manager.contracts['AnotherContract'].address, value1: 0, value2: false, value3: 0
    })

    await new Promise(resolve => setTimeout(resolve, 10000))
    const dataFromMyContract = await manager.contracts['MyContract'].RunContract('getData', {})
    console.log(dataFromMyContract)
    const dataFromAnotherContract = await manager.contracts['AnotherContract'].RunContract('getData', {}, keysForAnotherContract)
    console.log(dataFromAnotherContract)

    assert.ok(dataFromMyContract.c !== '0x0')
  })
})
