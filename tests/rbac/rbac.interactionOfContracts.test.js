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

// roles in contract AccessCard
const SUPERADMIN = '0x1'
const ADMIN = '0x2'
const MODERATOR = '0x3'
const USER = '0x4'

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
      path.join(__dirname, '../../rbac/AccessController.tvc'),
      path.join(__dirname, '../../rbac/AccessController.abi.json')
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
    const deployAccessCardRes = await manager.contracts['AccessController'].runContract('deployAccessCardWithPubkey', {
      pubkey: '0x' + keyPair.public
    })
    await manager.addContractFromAddress(deployAccessCardRes.deployedContract, accessCardAbiPath, contractName) // add contract to manager
    if (assertThatDeployed) {
      assert.deepStrictEqual(manager.contracts[contractName].isDeployed, true)
    }
    return keyPair
  }

  it('Test: AccessController.deployAccessCardWithPubkey - should grant first superadmin, change superAdminAddress in AccessController, change role in AccessCard', async function () {
    // --- Deployment the AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')

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
    // check AccessCard role after granting
    const getRoleAfterGrantingRes = await manager.contracts['AccessCard1'].runContract('getRole', {}, keysForAccessCard1)
    assert.deepStrictEqual(getRoleAfterGrantingRes.my_role, SUPERADMIN)
  })

  it.only('Test: AccessCard.grantRole and AccessCard.changeRole and AccessController.changeAdmin - should change superadmin, change superAdminAddress in AccessController, change role in both AccessCards', async function () {
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2')
    await manager.giveToAddress(manager.contracts['AccessCard1'].address)
    await manager.giveToAddress(manager.contracts['AccessCard1'].address)

    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address
    })

    // check superAdminAddress before change the superadmin
    const superAdminAddressRes = await manager.contracts['AccessController'].runContract('getSuperAdminAddress', {})
    assert.deepStrictEqual(superAdminAddressRes.value0, manager.contracts['AccessCard1'].address)
    // check roles before change the superadmin
    const getRoleAccessCard1Res = await manager.contracts['AccessCard1'].runContract('getRole', {}, keysForAccessCard1)
    assert.deepStrictEqual(getRoleAccessCard1Res.my_role, SUPERADMIN)
    const getRoleAccessCard2Res = await manager.contracts['AccessCard2'].runContract('getRole', {}, keysForAccessCard2)
    assert.deepStrictEqual(getRoleAccessCard2Res.my_role, USER)

    // change SUPERADMIN (grant to second AccessCard)
    await manager.contracts['AccessCard1'].runContract(
      'grantRole',
      { role: SUPERADMIN, targetAddress: manager.contracts['AccessCard2'].address },
      keysForAccessCard1
    )

    // check roles after change the superadmin
    const getRoleAccessCard1AfterRes = await manager.contracts['AccessCard1'].runContract('getRole', {}, keysForAccessCard1)
    assert.deepStrictEqual(getRoleAccessCard1AfterRes.my_role, USER)
    const getRoleAccessCard2AfterRes = await manager.contracts['AccessCard2'].runContract('getRole', {}, keysForAccessCard2)
    assert.deepStrictEqual(getRoleAccessCard2AfterRes.my_role, SUPERADMIN)
    // check superAdminAddress after change the superadmin
    const superAdminAddressAfterGrantingRes = await manager.contracts['AccessController'].runContract('getSuperAdminAddress', {})
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log(superAdminAddressAfterGrantingRes.value0, manager.contracts['AccessCard1'].address, manager.contracts['AccessCard2'].address)
    assert.deepStrictEqual(superAdminAddressAfterGrantingRes.value0, manager.contracts['AccessCard2'].address)
  })

  
  /* it('Test: AccessCard.grantRole and AccessController.changeAdmin (+ onBounce) - should not change superadmin if you are not superadmin', async function () {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')
    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2')
    // --- Deployment the third AccessCard ---
    const keysForAccessCard3 = await deployAccessCardFromAccessController('AccessCard3')

    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address
    })

    // Grant admin to second AccessCard
    await manager.contracts['AccessCard1'].RunContract(
      'grantRole',
      { role: toHex('ADMIN'), targetAddress: manager.contracts['AccessCard2'].address },
      keysForAccessCard1
    )

    // check superAdminAddress before change the superadmin
    const superAdminAddressRes = await manager.contracts['AccessController'].RunContract('getSuperAdminAddress', {})
    assert.deepStrictEqual(superAdminAddressRes.value0, manager.contracts['AccessCard1'].address)
    // check roles before change the superadmin
    const getRoleAccessCard1Res = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1)
    assert.deepStrictEqual(fromHexWith0x(getRoleAccessCard1Res.my_role), 'SUPERADMIN')
    const getRoleAccessCard2Res = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2)
    assert.deepStrictEqual(fromHexWith0x(getRoleAccessCard2Res.my_role), 'ADMIN')
    const getRoleAccessCard3Res = await manager.contracts['AccessCard3'].RunContract('getRole', {}, keysForAccessCard3)
    assert.deepStrictEqual(fromHexWith0x(getRoleAccessCard3Res.my_role), 'USER')

    // try to change the superadmin by not superadmin
    await manager.contracts['AccessCard2'].RunContract(
      'grantRole',
      { role: toHex('SUPERADMIN'), targetAddress: manager.contracts['AccessCard3'].address },
      keysForAccessCard2
    )
    await new Promise(resolve => setTimeout(resolve, 2000))
    const getInfo1 = await manager.contracts['AccessCard1'].RunContract('getInfo', {}, keysForAccessCard1).catch(e => console.log(e))
    const getInfo2 = await manager.contracts['AccessCard2'].RunContract('getInfo', {}, keysForAccessCard2).catch(e => console.log(e))
    const getInfo3 = await manager.contracts['AccessCard3'].RunContract('getInfo', {}, keysForAccessCard3).catch(e => console.log(e))
    console.log(getInfo1, getInfo2, getInfo3)

    // check roles after trying to change the superadmin
    const getRoleAccessCard1AfterRes = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1)
    console.log(fromHexWith0x(getRoleAccessCard1AfterRes.my_role), fromHexWith0x(getRoleAccessCard1Res.my_role))
    //assert.deepStrictEqual(fromHexWith0x(getRoleAccessCard1AfterRes.my_role), fromHexWith0x(getRoleAccessCard1Res.my_role))
    const getRoleAccessCard2AfterRes = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2)
    console.log(fromHexWith0x(getRoleAccessCard2AfterRes.my_role), fromHexWith0x(getRoleAccessCard2Res.my_role))
    //assert.deepStrictEqual(fromHexWith0x(getRoleAccessCard2AfterRes.my_role), fromHexWith0x(getRoleAccessCard2Res.my_role))
    const getRoleAccessCard3AfterRes = await manager.contracts['AccessCard3'].RunContract('getRole', {}, keysForAccessCard3)
    console.log(fromHexWith0x(getRoleAccessCard3AfterRes.my_role), fromHexWith0x(getRoleAccessCard3Res.my_role))
    //assert.deepStrictEqual(fromHexWith0x(getRoleAccessCard3AfterRes.my_role), fromHexWith0x(getRoleAccessCard3Res.my_role))
    // check superAdminAddress after change the superadmin
    const superAdminAddressAfterGrantingRes = await manager.contracts['AccessController'].RunContract('getSuperAdminAddress', {})
    console.log(superAdminAddressAfterGrantingRes.value0, manager.contracts['AccessCard1'].address)

    assert.deepStrictEqual(superAdminAddressAfterGrantingRes.value0, manager.contracts['AccessCard1'].address)
  }) */
})
