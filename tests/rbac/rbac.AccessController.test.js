/* eslint-disable dot-notation */
/**
 * Tests: contract AccessController.
 *
 * Run this tests from root directory: `ton-env test -p ./tests/rbac/<current file name>.test.js`
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const runLocal = require('../helper').runLocal

const accessControllerAbiPath = path.join(__dirname, '../../build/AccessController.abi.json')
const accessControllerTvcPath = path.join(__dirname, '../../build/AccessController.tvc')

const accessCardAbiPath = path.join(__dirname, '../../build/AccessCard.abi.json')
const accessCardTvcPath = path.join(__dirname, '../../build/AccessCard.tvc')

describe('RBAC: AccessController', function () {
  let manager

  before(async function () {
    console.log('Start..')
    await restart() // recreate and start containers
  })

  beforeEach(async function () {
    manager = new Manager()
    await manager.createClient(['http://localhost:80/graphql'])
    await manager.loadContract(
      accessControllerTvcPath,
      accessControllerAbiPath
    )
    await manager.loadContract(
      accessCardTvcPath,
      accessCardAbiPath
    )
  })

  it('Test: Should deploy AccessController', async function () {
    await manager.contracts['AccessController'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })
    assert.deepStrictEqual(manager.contracts['AccessController'].isDeployed, true)
  })

  it('Test: getSuperAdminAddress - before first granting should be equals contract address', async function () {
    await manager.contracts['AccessController'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })
    const superAdminAddressRes = await runLocal(manager, 'AccessController', 'getSuperAdminAddress', {})
    assert.deepStrictEqual(superAdminAddressRes.value0, manager.contracts['AccessController'].address)
  })

  it('Test: getInitialValue - should return correct value that was specified on deployment', async function () {
    const initialValue = 1000000
    await manager.contracts['AccessController'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })
    const getInitialValueRes = await runLocal(manager, 'AccessController', 'getInitialValue', {})
    assert.deepStrictEqual(parseInt(getInitialValueRes.value0, 16), initialValue)
    // интересно, что assert.equal(getInitialValueRes.value0, initialValue) также вернёт true. Судя по всему, equal неявно приводит аргументы к одному типу
  })

  it('Test: updateInitialValue - should update initial value', async function () {
    await manager.contracts['AccessController'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })
    const newInitialValue = 2000000
    await manager.contracts['AccessController'].runContract('updateInitialValue', { newInitialValue })

    const getInitialValueRes = await runLocal(manager, 'AccessController', 'getInitialValue', {})
    assert.deepStrictEqual(parseInt(getInitialValueRes.value0, 16), newInitialValue)
  })

  it('Test: updateInitialValue - should forbid update initial value by not owner', async function () {
    const initialValue = 1000000
    await manager.contracts['AccessController'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: initialValue
    })
    assert.deepStrictEqual(manager.contracts['AccessController'].isDeployed, true)

    // generate another contract
    /* const keysForWallet = await manager.createKeysAndReturn()
    const wallet = await manager.createWallet(keysForWallet)
    await wallet.deploy() */

    // check that can not update initial value by not owner
    let error
    await manager.contracts['AccessController'].runContract(
      'updateInitialValue', { newInitialValue: 2000000 }, null/* , keysForWallet  */
    ).catch(e => { error = e })
    assert.ok((error.data.exit_code === 102) || (error.data.tip === 'Check sign keys')) // TODO см. тудушку в AccessController

    // check that initial value was not changed
    const getInitialValueRes = await runLocal(manager, 'AccessController', 'getInitialValue', {})
    assert.deepStrictEqual(parseInt(getInitialValueRes.value0, 16), initialValue)
  })

  it('Test: deployAccessCardWithPubkey - should deploy contract AccessCard from AccessController', async function () {
    await manager.contracts['AccessController'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })
    // deploy access card
    const keysForAccessCard1 = await manager.createKeysAndReturn()
    await manager.loadContract(accessCardTvcPath, accessCardAbiPath, { contractName: 'AccessCard1', keys: keysForAccessCard1 })
    await manager.contracts['AccessCard1'].deployContract({
      _accessControllerAddress: manager.contracts['AccessController'].address,
      _myPublicKey: '0x' + keysForAccessCard1.public,
      _myInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' })
    })
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true)
  })

  it('Test: deployAccessCardWithPubkey - should grant first superadmin, change superAdminAddress in AccessController', async function () {
    await manager.contracts['AccessController'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })
    // deploy access card
    const keysForAccessCard1 = await manager.createKeysAndReturn()
    await manager.loadContract(
      accessCardTvcPath,
      accessCardAbiPath,
      { contractName: 'AccessCard1', keys: keysForAccessCard1 }
    )
    await manager.contracts['AccessCard1'].deployContract({
      _accessControllerAddress: manager.contracts['AccessController'].address,
      _myPublicKey: '0x' + keysForAccessCard1.public,
      _myInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' })
    })
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true)

    // check superAdminAddress before granting
    const superAdminAddressRes = await runLocal(manager, 'AccessController', 'getSuperAdminAddress', {})
    assert.deepStrictEqual(superAdminAddressRes.value0, manager.contracts['AccessController'].address)
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address
    })
    // check superAdminAddress after granting
    const superAdminAddressAfterGrantingRes = await runLocal(manager, 'AccessController', 'getSuperAdminAddress', {})
    assert.deepStrictEqual(superAdminAddressAfterGrantingRes.value0, manager.contracts['AccessCard1'].address)
  })

  it('Test: grantSuperAdminRole - should forbid to grant superadmin by not admin', async function () {
    await manager.contracts['AccessController'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })
    // deploy access card
    const keysForAccessCard1 = await manager.createKeysAndReturn()
    await manager.loadContract(accessCardTvcPath, accessCardAbiPath, { contractName: 'AccessCard1', keys: keysForAccessCard1 })
    await manager.contracts['AccessCard1'].deployContract({
      _accessControllerAddress: manager.contracts['AccessController'].address,
      _myPublicKey: '0x' + keysForAccessCard1.public,
      _myInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' })
    })
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true)

    // try call by another contract (with another keys)
    let error
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address
    }, keysForAccessCard1).catch(e => { error = e })
    assert.ok((error.data.exit_code === 102) || (error.data.tip === 'Check sign keys'))
  })

  it('Test: grantSuperAdminRole - should forbid to grant superadmin second time', async function () {
    await manager.contracts['AccessController'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })
    // deploy first AccessCard
    const keysForAccessCard1 = await manager.createKeysAndReturn()
    await manager.loadContract(accessCardTvcPath, accessCardAbiPath, { contractName: 'AccessCard1', keys: keysForAccessCard1 })
    await manager.contracts['AccessCard1'].deployContract({
      _accessControllerAddress: manager.contracts['AccessController'].address,
      _myPublicKey: '0x' + keysForAccessCard1.public,
      _myInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' })
    })
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true)

    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address
    })

    let error
    // Try to grant superadmin again
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address
    }).catch(e => { error = e })
    assert.deepStrictEqual(error.data.exit_code, 101)

    // deploy second AccessCard
    const keysForAccessCard2 = await manager.createKeysAndReturn()
    await manager.loadContract(accessCardTvcPath, accessCardAbiPath, { contractName: 'AccessCard2', keys: keysForAccessCard2 })
    await manager.contracts['AccessCard2'].deployContract({
      _accessControllerAddress: manager.contracts['AccessController'].address,
      _myPublicKey: '0x' + keysForAccessCard1.public,
      _myInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' })
    })
    assert.deepStrictEqual(manager.contracts['AccessCard2'].isDeployed, true)

    // Try to grant superadmin again
    error = undefined
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard2'].address
    }).catch(e => { error = e })
    assert.deepStrictEqual(error.data.exit_code, 101)

    // check that superAdminAddress not changed
    const superAdminAddressRes = await runLocal(manager, 'AccessController', 'getSuperAdminAddress', {})
    assert.deepStrictEqual(superAdminAddressRes.value0, manager.contracts['AccessCard1'].address)
  })

  it('Test: changeSuperAdmin - should forbid to call by not AccessCard (check invalid init state error)', async function () {
    await manager.contracts['AccessController'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })

    // generate another contract
    const keysForWallet = await manager.createKeysAndReturn()
    const wallet = await manager.createWallet(keysForWallet)
    await wallet.deploy()

    let error
    // Try to call changeSuperAdmin by contract with another init state
    await manager.contracts['AccessController'].runContract('changeSuperAdmin', {
      newSuperAdminAddress: wallet.address,
      touchingPublicKey: '0x' + keysForWallet.public
    }).catch(e => { error = e })
    assert.deepStrictEqual(error.data.exit_code, 111)
  })
})
