/* eslint-disable dot-notation */
/**
 * Tests: Interaction of contracts AccessController and AccessCards.
 *
 * Run this tests from root directory: `ton-env test -p ./tests/rbac/<current file name>.test.js`
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const fromHexWith0x = require('../helper').fromHexWith0x
const toHex = require('../helper').toHex

const accessCardAbiPath = path.join(__dirname, '../../rbac/AccessCard.abi.json')
const accessCardTvcPath = path.join(__dirname, '../../rbac/AccessCard.tvc')

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
      path.join(__dirname, '../../rbac/AccessController.tvc'),
      path.join(__dirname, '../../rbac/AccessController.abi.json')
    )
    manager.loadContract(
      accessCardTvcPath,
      accessCardAbiPath
    )
    await manager.contracts['AccessController'].DeployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })
  })

  /**
   * Deploy AccessCard from AccessController
   */
  async function deployAccessCardFromAccessController (contractName, assertThatDeployed = true) {
    const keyPair = await manager.createKeysAndReturn()
    const deployAccessCardRes = await manager.contracts['AccessController'].RunContract('deployAccessCardWithPubkey', {
      pubkey: '0x' + keyPair.public
    })
    manager.AddContractFromAddress(deployAccessCardRes.deployedContract, accessCardAbiPath, contractName) // add contract to manager
    if (assertThatDeployed) {
      assert.deepStrictEqual(manager.contracts[contractName].isDeployed, true)
    }
    return keyPair
  }

  it('Test: AccessController.deployAccessCardWithPubkey - should grant first superadmin, change superAdminAddress in AccessController, change role in AccessCard', async function () {
    // --- Deployment the AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')

    // check superAdminAddress before granting
    const superAdminAddressRes = await manager.contracts['AccessController'].RunContract('getSuperAdminAddress', {})
    assert.deepStrictEqual(superAdminAddressRes.value0, manager.contracts['AccessController'].address)
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address
    })
    // check superAdminAddress after granting
    const superAdminAddressAfterGrantingRes = await manager.contracts['AccessController'].RunContract('getSuperAdminAddress', {})
    assert.deepStrictEqual(superAdminAddressAfterGrantingRes.value0, manager.contracts['AccessCard1'].address)
    // check AccessCard role after granting
    const getRoleAfterGrantingRes = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1)
    assert.deepStrictEqual(fromHexWith0x(getRoleAfterGrantingRes.my_role), 'SUPERADMIN')
  })

  it('Test: AccessCard.grantRole - should change superadmin, change superAdminAddress in AccessController, change role in both AccessCards', async function () {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')
    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2')

    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address
    })

    // check superAdminAddress before change the superadmin
    const superAdminAddressRes = await manager.contracts['AccessController'].RunContract('getSuperAdminAddress', {})
    assert.deepStrictEqual(superAdminAddressRes.value0, manager.contracts['AccessCard1'].address)
    // check roles before change the superadmin
    const getRoleAccessCard1Res = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1)
    assert.deepStrictEqual(fromHexWith0x(getRoleAccessCard1Res.my_role), 'SUPERADMIN')
    const getRoleAccessCard2Res = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2)
    assert.deepStrictEqual(fromHexWith0x(getRoleAccessCard2Res.my_role), 'USER')

    // change SUPERADMIN (grant to second AccessCard)
    await manager.contracts['AccessCard1'].RunContract(
      'grantRole',
      { role: toHex('SUPERADMIN'), targetAddress: manager.contracts['AccessCard2'].address },
      keysForAccessCard1
    )

    // check roles after change the superadmin
    const getRoleAccessCard1AfterRes = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1)
    assert.deepStrictEqual(fromHexWith0x(getRoleAccessCard1AfterRes.my_role), 'USER')
    const getRoleAccessCard2AfterRes = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2)
    assert.deepStrictEqual(fromHexWith0x(getRoleAccessCard2AfterRes.my_role), 'SUPERADMIN')
    // check superAdminAddress after change the superadmin
    const superAdminAddressAfterGrantingRes = await manager.contracts['AccessController'].RunContract('getSuperAdminAddress', {})
    assert.deepStrictEqual(superAdminAddressAfterGrantingRes.value0, manager.contracts['AccessCard2'].address)
  })
})
