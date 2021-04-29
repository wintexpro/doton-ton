/* eslint-disable dot-notation */
/**
 * Tests: Interaction of contracts AccessController and AccessCards.
 *
 * Run this tests from root directory: `ton-env test -p ./tests/rbac/<current file name>.test.js`
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const runLocal = require('../helper').runLocal

const accessCardAbiPath = path.join(__dirname, '../../build/AccessCard.abi.json')
const accessCardTvcPath = path.join(__dirname, '../../build/AccessCard.tvc')

// roles in contract AccessCard
/* eslint-disable no-unused-vars */
const SUPERADMIN = '0x1'
const ADMIN = '0x2'
const MODERATOR = '0x3'
const USER = '0x4'
/* eslint-enable no-unused-vars */

describe('Asserts', function () {
  let manager

  before(async function () {
    console.log('Start..')
    await restart() // recreate and start containers
  })

  beforeEach(async function () {
    manager = new Manager()
    await manager.createClient(['http://localhost:80/graphql'])
    await manager.loadContract(
      path.join(__dirname, '../../build/AccessController.tvc'),
      path.join(__dirname, '../../build/AccessController.abi.json')
    )
    await manager.loadContract(
      accessCardTvcPath,
      accessCardAbiPath
    )
    await manager.contracts['AccessController'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })
  })

  /**
   * Deploy AccessCard from AccessController
   */
  async function deployAccessCardFromAccessController (contractName, assertThatDeployed = true) {
    const keyPair = await manager.createKeysAndReturn()
    await manager.loadContract(accessCardTvcPath, accessCardAbiPath, { contractName, keys: keyPair })
    await manager.contracts[contractName].deployContract({
      _accessControllerAddress: manager.contracts['AccessController'].address,
      _myPublicKey: '0x' + keyPair.public,
      _myInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' })
    })
    if (assertThatDeployed) {
      assert.deepStrictEqual(manager.contracts[contractName].isDeployed, true)
    }
    return keyPair
  }

  it('Test: AccessController.deployAccessCardWithPubkey - should grant first superadmin, change superAdminAddress in AccessController, change role in AccessCard', async function () {
    // --- Deployment the AccessCard ---
    /* const keysForAccessCard1 =  */await deployAccessCardFromAccessController('AccessCard1')

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
    // check AccessCard role after granting
    const getRoleAfterGrantingRes = await runLocal(manager, 'AccessCard1', 'getRole', {})
    assert.deepStrictEqual(getRoleAfterGrantingRes.my_role, SUPERADMIN)
  })

  it('Test: AccessCard.grantRole and AccessCard.changeRole and AccessController.changeAdmin - should change superadmin, change superAdminAddress in AccessController, change role in both AccessCards', async function () {
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')
    /* const keysForAccessCard2 =  */await deployAccessCardFromAccessController('AccessCard2')
    await manager.giveToAddress(manager.contracts['AccessCard1'].address)
    await manager.giveToAddress(manager.contracts['AccessCard1'].address)

    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address
    })

    // check superAdminAddress before change the superadmin
    const superAdminAddressRes = await runLocal(manager, 'AccessController', 'getSuperAdminAddress', {})
    assert.deepStrictEqual(superAdminAddressRes.value0, manager.contracts['AccessCard1'].address)
    // check roles before change the superadmin
    const getRoleAccessCard1Res = await runLocal(manager, 'AccessCard1', 'getRole', {})
    assert.deepStrictEqual(getRoleAccessCard1Res.my_role, SUPERADMIN)
    const getRoleAccessCard2Res = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(getRoleAccessCard2Res.my_role, USER)

    // change SUPERADMIN (grant to second AccessCard)
    await manager.contracts['AccessCard1'].runContract(
      'grantRole',
      { role: SUPERADMIN, targetAddress: manager.contracts['AccessCard2'].address },
      keysForAccessCard1
    )

    // check roles after change the superadmin
    const getRoleAccessCard1AfterRes = await runLocal(manager, 'AccessCard1', 'getRole', {})
    assert.deepStrictEqual(getRoleAccessCard1AfterRes.my_role, USER)
    const getRoleAccessCard2AfterRes = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(getRoleAccessCard2AfterRes.my_role, SUPERADMIN)
    // check superAdminAddress after change the superadmin
    const superAdminAddressAfterGrantingRes = await runLocal(manager, 'AccessController', 'getSuperAdminAddress', {})
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log(superAdminAddressAfterGrantingRes.value0, manager.contracts['AccessCard1'].address, manager.contracts['AccessCard2'].address)
    assert.deepStrictEqual(superAdminAddressAfterGrantingRes.value0, manager.contracts['AccessCard2'].address)
  })
})
