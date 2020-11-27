/* eslint-disable dot-notation */
/**
 * Tests: contract AccessController.
 *
 * Run this tests from root directory: `ton-env test -p ./tests/rbac/<current file name>.test.js`
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const { toHex } = require('../helper')

const accessCardAbiPath = path.join(__dirname, '../../rbac/AccessCard.abi.json')
const accessCardTvcPath = path.join(__dirname, '../../rbac/AccessCard.tvc')

describe('RBAC: AccessController', function () {
  let manager

  before(async function () {
    console.log('Start..')
    await restart() // recreate and start containers
  })

  beforeEach(async function () {
    manager = new Manager()
    await manager.createClient(['http://localhost:80/graphql'])
    await manager.createKeys()
    manager.loadContract(
      path.join(__dirname, '../../rbac/AccessController.tvc'),
      path.join(__dirname, '../../rbac/AccessController.abi.json')
    )
    manager.loadContract(
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
    const superAdminAddressRes = await manager.contracts['AccessController'].runContract('getSuperAdminAddress', {})
    assert.deepStrictEqual(superAdminAddressRes.value0, manager.contracts['AccessController'].address)
  })

  it('Test: getInitialValue - should return correct value that was specified on deployment', async function () {
    const initialValue = 1000000
    await manager.contracts['AccessController'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })
    const getInitialValueRes = await manager.contracts['AccessController'].runContract('getInitialValue', {})
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

    const getInitialValueRes = await manager.contracts['AccessController'].runContract('getInitialValue', {})
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
    const keysForWallet = await manager.createKeysAndReturn()
    const wallet = await manager.createWallet(keysForWallet)
    await wallet.Deploy()

    // check that can not update initial value by not owner
    let error
    await manager.contracts['AccessController'].runContract(
      'updateInitialValue', { newInitialValue: 2000000 }, keysForWallet /* keysForAccessController2 */
    ).catch(e => { error = e })
    assert.ok((error.data.exit_code === 102) || (error.data.tip === 'Check sign keys')) // TODO см. тудушку в AccessController

    // check that initial value was not changed
    const getInitialValueRes = await manager.contracts['AccessController'].runContract('getInitialValue', {})
    assert.deepStrictEqual(parseInt(getInitialValueRes.value0, 16), initialValue)
  })

  it('Test: deployAccessCardWithPubkey - should deploy contract AccessCard from AccessController', async function () {
    await manager.contracts['AccessController'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })
    const keysForAccessCard1 = await manager.createKeysAndReturn()
    const deployAccessCardRes = await manager.contracts['AccessController'].runContract('deployAccessCardWithPubkey', {
      pubkey: '0x' + keysForAccessCard1.public
    })
    await manager.addContractFromAddress(deployAccessCardRes.deployedContract, accessCardAbiPath, 'AccessCard1')
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true)
  })

  it('Test: deployAccessCardWithPubkey - should grant first superadmin, change superAdminAddress in AccessController', async function () {
    await manager.contracts['AccessController'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })
    const keysForAccessCard1 = await manager.createKeysAndReturn()
    const deployAccessCardRes = await manager.contracts['AccessController'].runContract('deployAccessCardWithPubkey', {
      pubkey: '0x' + keysForAccessCard1.public
    })
    await manager.addContractFromAddress(deployAccessCardRes.deployedContract, accessCardAbiPath, 'AccessCard1')
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true)

    // check superAdminAddress before granting
    const superAdminAddressRes = await manager.contracts['AccessController'].runContract('getSuperAdminAddress', {})
    assert.deepStrictEqual(superAdminAddressRes.value0, manager.contracts['AccessController'].address)
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address
    })
    // check superAdminAddress after granting
    const superAdminAddressAfterGrantingRes = await manager.contracts['AccessController'].runContract('getSuperAdminAddress', {})
    assert.deepStrictEqual(superAdminAddressAfterGrantingRes.value0, manager.contracts['AccessCard1'].address)
  })

  it('Test: grantSuperAdminRole - should forbid to grant superadmin by not admin', async function () {
    await manager.contracts['AccessController'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })
    // deploy first AccessCard
    const keysForAccessCard1 = await manager.createKeysAndReturn()
    const deployAccessCardRes = await manager.contracts['AccessController'].runContract('deployAccessCardWithPubkey', {
      pubkey: '0x' + keysForAccessCard1.public
    })
    await manager.addContractFromAddress(deployAccessCardRes.deployedContract, accessCardAbiPath, 'AccessCard1')
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
    const deployAccessCardRes = await manager.contracts['AccessController'].runContract('deployAccessCardWithPubkey', {
      pubkey: '0x' + keysForAccessCard1.public
    })
    await manager.addContractFromAddress(deployAccessCardRes.deployedContract, accessCardAbiPath, 'AccessCard1')
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
    const deployAccessCard2Res = await manager.contracts['AccessController'].runContract('deployAccessCardWithPubkey', {
      pubkey: '0x' + keysForAccessCard2.public
    })
    await manager.addContractFromAddress(deployAccessCard2Res.deployedContract, accessCardAbiPath, 'AccessCard2')
    assert.deepStrictEqual(manager.contracts['AccessCard2'].isDeployed, true)

    // Try to grant superadmin again
    error = undefined
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard2'].address
    }).catch(e => { error = e })
    assert.deepStrictEqual(error.data.exit_code, 101)

    // check that superAdminAddress not changed
    const superAdminAddressRes = await manager.contracts['AccessController'].runContract('getSuperAdminAddress', {})
    assert.deepStrictEqual(superAdminAddressRes.value0, manager.contracts['AccessCard1'].address)
  })

  it('Test: changeAdmin - should forbid to call by himself', async function () {
    await manager.contracts['AccessController'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })

    // generate another contract
    const keysForWallet = await manager.createKeysAndReturn()
    const wallet = await manager.createWallet(keysForWallet)
    await wallet.Deploy()

    let error
    // Try to call changeAdmin by himself
    await manager.contracts['AccessController'].runContract('changeAdmin', {
      newSuperAdminAddress: wallet.address,
      oldSuperAdminAddress: manager.contracts['AccessController'].address,
      value2: toHex('USER')
    }).catch(e => { error = e })
    assert.deepStrictEqual(error.data.exit_code, 103)
  })
})
