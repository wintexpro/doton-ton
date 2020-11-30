/* eslint-disable dot-notation */
/**
 * Tests: contract AccessCards.
 *
 * Run this tests from root directory: `ton-env test -p ./tests/rbac/<current file name>.test.js`
 */

const assert = require('assert')
const fs = require('fs')
const path = require('path')
const runLocal = require('../helper').runLocal

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
  async function deployAccessCardFromAccessController (contractName, assertThatDeployed = true, _manager = manager, keysForAccessController = undefined) {
    const keyPair = await _manager.createKeysAndReturn()
    const deployAccessCardRes = await _manager.contracts['AccessController'].runContract('deployAccessCardWithPubkey', {
      pubkey: '0x' + keyPair.public
    }, keysForAccessController || _manager.keys).catch(e => console.log('deployAccessCardWithPubkey:', e))
    await deployCheck(deployAccessCardRes.deployedContract, _manager)
    // await new Promise(resolve => setTimeout(resolve, 20000))
    await _manager.addContractFromAddress(deployAccessCardRes.deployedContract, accessCardAbiPath, contractName, keyPair) // add contract to _manager
    _manager.contracts[contractName].address = deployAccessCardRes.deployedContract
    if (assertThatDeployed) {
      assert.deepStrictEqual(_manager.contracts[contractName].isDeployed, true)
    }
    return keyPair
  }

  // fucntion wait while smart-contract has been deployed on `address`
  async function deployCheck (address, _manager) {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const accountInfo = await _manager.client.queries.accounts.query({ id: { eq: address } }, 'id')
      // console.log('address:', accountInfo)
      if (accountInfo.length > 0) break
    }
  }

  it('Test: grantSuperAdmin - should forbid call by not contract with `accessControllerAddress`', async function () {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')

    // case 1: try to call himself
    let error
    await manager.contracts['AccessCard1'].runContract('grantSuperAdmin', {}, keysForAccessCard1).catch(e => { error = e })
    assert.deepStrictEqual(error.data.exit_code, 107)

    // case 2: try to call from another AccessController
    // --- Deployment the another AccessController ---
    const keysForAccessController2 = await manager.createKeysAndReturn()
    await manager.loadContract(
      path.join(__dirname, '../../rbac/AccessController.tvc'),
      path.join(__dirname, '../../rbac/AccessController.abi.json'),
      { contractName: 'AccessController2', keys: keysForAccessController2 }
    )
    await manager.contracts['AccessController2'].deployContract({
      _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
      _initialValue: 1000000
    })
    await manager.giveToAddress(manager.contracts['AccessController2'].address)
    await manager.contracts['AccessController2'].runContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address
    }, keysForAccessController2)

    // check that role has not been changed
    const getRoleRes = await runLocal(manager, 'AccessCard1', 'getRole', {})
    assert.deepStrictEqual(getRoleRes.my_role, USER)
  })

  it('Test: grantSuperAdmin - calling from AccessController should change role on `SUPERADMIN`', async function () {
    await deployAccessCardFromAccessController('AccessCard1')
    const getRoleBeforeGrantingRes = await runLocal(manager, 'AccessCard1', 'getRole', {})
    assert.deepStrictEqual(getRoleBeforeGrantingRes.my_role, USER)

    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', { accessCardAddress: manager.contracts['AccessCard1'].address })
    const getRoleAfterGrantingRes = await runLocal(manager, 'AccessCard1', 'getRole', {})
    assert.deepStrictEqual(getRoleAfterGrantingRes.my_role, SUPERADMIN)
  })

  it('Test: grantRole (+ getRole) - should change role by superadmin to another user', async function () {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', { accessCardAddress: manager.contracts['AccessCard1'].address })

    // --- Deployment the second AccessCard ---
    await deployAccessCardFromAccessController('AccessCard2')
    // check role before change
    const getRoleBeforeGrantingRes = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(getRoleBeforeGrantingRes.my_role, USER)

    // grant ADMIN to second AccessCard
    await manager.giveToAddress(manager.contracts['AccessCard1'].address)
    await manager.contracts['AccessCard1'].runContract('grantRole', { role: ADMIN, targetAddress: manager.contracts['AccessCard2'].address }, keysForAccessCard1)

    // check that role changed
    const getRoleAfterGrantingRes = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(getRoleAfterGrantingRes.my_role, ADMIN)
  })

  it('Test: grantRole (+ getRole) - should throw exception if try to grant role by himself', async function () {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', { accessCardAddress: manager.contracts['AccessCard1'].address })

    // get role before change
    const getRoleBeforeGrantingRes = await runLocal(manager, 'AccessCard1', 'getRole', {})
    assert.deepStrictEqual(getRoleBeforeGrantingRes.my_role, SUPERADMIN)

    // grant ADMIN to second AccessCard
    let error
    await manager.contracts['AccessCard1'].runContract(
      'grantRole',
      { role: ADMIN, targetAddress: manager.contracts['AccessCard1'].address },
      keysForAccessCard1
    ).catch(e => { error = e })
    assert.deepStrictEqual(error.data.exit_code, 105)

    // check that role has not been changed
    const getRoleAfterGrantingRes = await runLocal(manager, 'AccessCard1', 'getRole', {})
    assert.deepStrictEqual(getRoleAfterGrantingRes.my_role, getRoleBeforeGrantingRes.my_role)
  })

  it('Test: grantRole (+ getRole) - should throw exception if admin try to grant role that he is not allowed to grant', async function () {
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2')

    await manager.giveToAddress(manager.contracts['AccessCard1'].address)
    await manager.giveToAddress(manager.contracts['AccessCard2'].address)

    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', { accessCardAddress: manager.contracts['AccessCard1'].address })
    // Grant admin to second AccessCard
    await manager.contracts['AccessCard1'].runContract('grantRole', { role: ADMIN, targetAddress: manager.contracts['AccessCard2'].address }, keysForAccessCard1)
    // check roles before trying to change role
    const getRoleAccessCard1Res = await runLocal(manager, 'AccessCard1', 'getRole', {})
    assert.deepStrictEqual(getRoleAccessCard1Res.my_role, SUPERADMIN)
    const getRoleAccessCard2Res = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(getRoleAccessCard2Res.my_role, ADMIN)

    // try to grant admin by admin
    let error
    await manager.contracts['AccessCard2'].runContract(
      'grantRole',
      { role: ADMIN, targetAddress: manager.contracts['AccessCard1'].address },
      keysForAccessCard2
    ).catch(e => { error = e })
    assert.deepStrictEqual(error.data.exit_code, 103)

    // check roles after
    const getRoleAccessCard1AfterRes = await runLocal(manager, 'AccessCard1', 'getRole', {})
    assert.deepStrictEqual(getRoleAccessCard1AfterRes.my_role, getRoleAccessCard1Res.my_role)
    const getRoleAccessCard2AfterRes = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(getRoleAccessCard2AfterRes.my_role, getRoleAccessCard2Res.my_role)
  })

  it('Test: grantRole (+ getRole) - should throw exception if try to grant role by not current AccessCard owner', async function () {
    await deployAccessCardFromAccessController('AccessCard1')
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2')
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', { accessCardAddress: manager.contracts['AccessCard1'].address })

    // get target AccessCard role before change
    const getRoleBeforeGrantingRes = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(getRoleBeforeGrantingRes.my_role, USER)

    // grant ADMIN to second AccessCard
    let error
    await manager.contracts['AccessCard1'].runContract(
      'grantRole',
      { role: ADMIN, targetAddress: manager.contracts['AccessCard2'].address },
      keysForAccessCard2
    ).catch(e => { error = e })
    assert.ok((error.data.exit_code === 102) || (error.data.tip === 'Check sign keys'))

    // check that target AccessCard role has not been changed
    const getRoleAfterGrantingRes = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(getRoleAfterGrantingRes.my_role, getRoleBeforeGrantingRes.my_role)
  })

  it('Test: grantRole (+ getRole) - should throw exception if contract has not role `ADMIN` or `SUPERADMIN`. Case 1: Contract role is `USER`', async function () {
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')
    await deployAccessCardFromAccessController('AccessCard2')

    // get target AccessCard role before change
    const getRoleBeforeGrantingRes = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(getRoleBeforeGrantingRes.my_role, USER)

    // grant ADMIN to second AccessCard
    let error
    await manager.contracts['AccessCard1'].runContract(
      'grantRole',
      { role: ADMIN, targetAddress: manager.contracts['AccessCard2'].address },
      keysForAccessCard1
    ).catch(e => { error = e })
    assert.deepStrictEqual(error.data.exit_code, 101)

    // check that target AccessCard role has not been changed
    const getRoleAfterGrantingRes = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(getRoleAfterGrantingRes.my_role, getRoleBeforeGrantingRes.my_role)
  })

  it('Test: grantRole (+ getRole) - should throw exception if contract has not role `ADMIN` or `SUPERADMIN`. Case 2: Contract role is `MODERATOR`', async function () {
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2')
    const keysForAccessCard3 = await deployAccessCardFromAccessController('AccessCard3')
    await manager.giveToAddress(manager.contracts['AccessCard1'].address)
    await manager.giveToAddress(manager.contracts['AccessCard2'].address)
    await manager.giveToAddress(manager.contracts['AccessCard3'].address)
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', { accessCardAddress: manager.contracts['AccessCard1'].address })

    // grant ADMIN to second AccessCard by first AccessCard
    await manager.contracts['AccessCard1'].runContract('grantRole', { role: ADMIN, targetAddress: manager.contracts['AccessCard2'].address }, keysForAccessCard1)
    // check that role was changed
    const accessCard2RoleRes = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(accessCard2RoleRes.my_role, ADMIN)

    // grant MODERATOR to third AccessCard by second AccessCard
    await manager.contracts['AccessCard2'].runContract('grantRole', { role: MODERATOR, targetAddress: manager.contracts['AccessCard3'].address }, keysForAccessCard2)
    // check that role was changed
    const accessCard3RoleRes = await runLocal(manager, 'AccessCard3', 'getRole', {})
    assert.deepStrictEqual(accessCard3RoleRes.my_role, MODERATOR)

    let error
    // try to grant MODERATOR to second AccessCard by third AccessCard
    await manager.contracts['AccessCard3'].runContract(
      'grantRole',
      { role: MODERATOR, targetAddress: manager.contracts['AccessCard2'].address },
      keysForAccessCard3
    ).catch(e => { error = e })
    assert.deepStrictEqual(error.data.exit_code, 101)

    // check that third AccessCard role has not been changed
    const accessCard2RoleAfterRes = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(accessCard2RoleRes.my_role, accessCard2RoleAfterRes.my_role)
  })

  it('Test: grantRole (+ getRole) - should throw exception if try to grant incorrect role', async function () {
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')
    await deployAccessCardFromAccessController('AccessCard2')
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', { accessCardAddress: manager.contracts['AccessCard1'].address })

    // get target role before change
    const getRoleBeforeGrantingRes = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(getRoleBeforeGrantingRes.my_role, USER)

    // try to grant incorrect role to second AccessCard
    let error
    await manager.contracts['AccessCard1'].runContract(
      'grantRole',
      { role: 77, targetAddress: manager.contracts['AccessCard2'].address },
      keysForAccessCard1
    ).catch(e => { error = e })
    assert.deepStrictEqual(error.data.exit_code, 104)

    // check that target role has not been changed
    const getRoleAfterGrantingRes = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(getRoleAfterGrantingRes.my_role, getRoleBeforeGrantingRes.my_role)
  })

  it.only('Test (in net.ton.dev): grantRole + changeRole + onBounce - should not change target role if target role insuitable', async function () {
    const devMgr = new Manager()
    await devMgr.createClient(['net.ton.dev'])

    // import giver
    await devMgr.addContractFromAddress(
      '0:440c99337a4009fec7ad4895a08587f05ab98b9d5c341dfb2211d1c862f1ae78',
      path.join(__dirname, '../../CustomGiverForDevNet/WintexGiver.abi.json'),
      'WintexGiver'
    )
    const wintexGiverKeysObject = JSON.parse(fs.readFileSync(path.join(__dirname, '../../CustomGiverForDevNet/WintexGiver.keys.json')))

    // Deployment the AccessController:
    const keysForAccessController = await devMgr.createKeysAndReturn()
    await devMgr.loadContract(
      path.join(__dirname, '../../rbac/AccessController.tvc'),
      path.join(__dirname, '../../rbac/AccessController.abi.json'),
      { keys: keysForAccessController }
    )
    // send grams to future AccessController address
    await devMgr.contracts['WintexGiver'].runContract('sendMeGramsPls', { dest: devMgr.contracts['AccessController'].address, amount: 500000000 }, wintexGiverKeysObject)
    // deploy AccessController
    await devMgr.contracts['AccessController'].deployContract(
      {
        _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
        _initialValue: 100000000
      },
      false,
      keysForAccessController
    )
    await deployCheck(devMgr.contracts['AccessController'].address, devMgr)
    // Deployment the AccessCards
    await devMgr.loadContract(accessCardTvcPath, accessCardAbiPath, { contractName: 'AccessCard1' })
    await devMgr.loadContract(accessCardTvcPath, accessCardAbiPath, { contractName: 'AccessCard2' })
    await devMgr.loadContract(accessCardTvcPath, accessCardAbiPath, { contractName: 'AccessCard3' })
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1', true, devMgr, keysForAccessController)
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2', true, devMgr, keysForAccessController)
    const keysForAccessCard3 = await deployAccessCardFromAccessController('AccessCard3', true, devMgr, keysForAccessController)
    console.log('AccessCard1:', devMgr.contracts['AccessCard1'].address)
    console.log('AccessCard2:', devMgr.contracts['AccessCard2'].address)
    console.log('AccessCard3:', devMgr.contracts['AccessCard3'].address)
    // send grams to future AccessCards addresses
    await devMgr.contracts['WintexGiver'].runContract('sendMeGramsPls', { dest: devMgr.contracts['AccessCard1'].address, amount: 1000000000 }, wintexGiverKeysObject)
    await devMgr.contracts['WintexGiver'].runContract('sendMeGramsPls', { dest: devMgr.contracts['AccessCard2'].address, amount: 1000000000 }, wintexGiverKeysObject)
    await devMgr.contracts['WintexGiver'].runContract('sendMeGramsPls', { dest: devMgr.contracts['AccessCard3'].address, amount: 1000000000 }, wintexGiverKeysObject)

    // --- Grant first superadmin ---
    await devMgr.contracts['AccessController'].runContract('grantSuperAdminRole', {
      accessCardAddress: devMgr.contracts['AccessCard1'].address
    }, keysForAccessController).catch(e => console.log('grantSuperAdminRole:', e))
    await new Promise(resolve => resolve(resolve, 5000))

    // grant ADMIN to second AccessCard by first AccessCard
    await devMgr.contracts['AccessCard1'].runContract('grantRole', { role: ADMIN, targetAddress: devMgr.contracts['AccessCard2'].address }, keysForAccessCard1)
    await new Promise(resolve => resolve(resolve, 10000))
    // check that role was changed
    const accessCard2RoleRes = await devMgr.contracts['AccessCard2'].runContract('getRole', {}, keysForAccessCard2)
    assert.deepStrictEqual(accessCard2RoleRes.my_role, ADMIN)

    // grant ADMIN to third AccessCard by first AccessCard
    await devMgr.contracts['AccessCard1'].runContract('grantRole', { role: ADMIN, targetAddress: devMgr.contracts['AccessCard3'].address }, keysForAccessCard1)
    // check third AccessCard role
    const accessCard3RoleRes = await devMgr.contracts['AccessCard3'].runContract('getRole', {}, keysForAccessCard3)
    assert.deepStrictEqual(accessCard3RoleRes.my_role, ADMIN)

    // ========== cases: ==========
    // ========== case 1: try to grant MODERATOR by ADMIN to ADMIN ==========
    console.log('case 1:')
    // Dont throw error because onBound() will catch this and rollback updates
    await devMgr.contracts['AccessCard2'].runContract(
      'grantRole',
      { role: MODERATOR, targetAddress: devMgr.contracts['AccessCard3'].address },
      keysForAccessCard2
    )
    await new Promise(resolve => resolve(resolve, 20000))
    // for debug: next commented lines
    // const getInfo1 = await devMgr.contracts['AccessCard1'].runContract('getInfo', {}, keysForAccessCard1).catch(e => console.log(e))
    // const getInfo2 = await devMgr.contracts['AccessCard2'].runContract('getInfo', {}, keysForAccessCard2).catch(e => console.log(e))
    // const getInfo3 = await devMgr.contracts['AccessCard3'].runContract('getInfo', {}, keysForAccessCard3).catch(e => console.log(e))
    // console.log(getInfo1, getInfo2, getInfo3)
    // check that third AccessCard role has not been changed
    const accessCard3RoleAfterCase1Res = await devMgr.contracts['AccessCard3'].runContract('getRole', {}, keysForAccessCard3)
    assert.deepStrictEqual(accessCard3RoleRes.my_role, accessCard3RoleAfterCase1Res.my_role)
    // check that second AccessCard role has not been changed
    const accessCard2RoleAfterCase1Res = await devMgr.contracts['AccessCard2'].runContract('getRole', {}, keysForAccessCard2)
    assert.deepStrictEqual(accessCard2RoleAfterCase1Res.my_role, accessCard2RoleRes.my_role)

    // ========== case 2: try to grant MODERATOR by ADMIN to SUPERADMIN ==========
    console.log('case 2:')
    // Dont throw error because onBound() will catch this and rollback updates
    await devMgr.contracts['AccessCard2'].runContract(
      'grantRole',
      { role: MODERATOR, targetAddress: devMgr.contracts['AccessCard1'].address },
      keysForAccessCard2
    )
    await new Promise(resolve => resolve(resolve, 20000))
    // for debug: next commented lines
    // const getInfo11 = await devMgr.contracts['AccessCard1'].runContract('getInfo', {}, keysForAccessCard1).catch(e => console.log(e))
    // const getInfo22 = await devMgr.contracts['AccessCard2'].runContract('getInfo', {}, keysForAccessCard2).catch(e => console.log(e))
    // const getInfo33 = await devMgr.contracts['AccessCard3'].runContract('getInfo', {}, keysForAccessCard3).catch(e => console.log(e))
    // console.log(getInfo11, getInfo22, getInfo33)
    // check that first AccessCard role has not been changed
    const accessCard1RoleAfterCase2Res = await devMgr.contracts['AccessCard1'].runContract('getRole', {}, keysForAccessCard1)
    assert.deepStrictEqual(accessCard1RoleAfterCase2Res.my_role, SUPERADMIN)
    // check that second AccessCard role has not been changed
    const accessCard2RoleAfterCase2Res = await devMgr.contracts['AccessCard2'].runContract('getRole', {}, keysForAccessCard2)
    assert.deepStrictEqual(accessCard2RoleAfterCase2Res.my_role, accessCard2RoleRes.my_role)
  })

  it('Test: grantRole (+ getRole, + onBounce) - should not change target role if you can not grant this role because target role insuitable', async function () {
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2')
    await deployAccessCardFromAccessController('AccessCard3')
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', { accessCardAddress: manager.contracts['AccessCard1'].address })

    await manager.giveToAddress(manager.contracts['AccessCard1'].address)
    await manager.giveToAddress(manager.contracts['AccessCard2'].address)

    // grant ADMIN to second AccessCard by first AccessCard
    await manager.contracts['AccessCard1'].runContract('grantRole', { role: ADMIN, targetAddress: manager.contracts['AccessCard2'].address }, keysForAccessCard1)
    // check that role was changed
    const accessCard2RoleRes = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(accessCard2RoleRes.my_role, ADMIN)

    // grant ADMIN to third AccessCard by first AccessCard
    await manager.contracts['AccessCard1'].runContract('grantRole', { role: ADMIN, targetAddress: manager.contracts['AccessCard3'].address }, keysForAccessCard1)
    // check that role was changed
    const accessCard3RoleRes = await await runLocal(manager, 'AccessCard3', 'getRole', {})
    assert.deepStrictEqual(accessCard3RoleRes.my_role, ADMIN)

    // ========== cases: ==========
    // ========== case 1: try to grant USER by ADMIN to SUPERADMIN==========
    // check first AccessCard role
    const accessCard1RoleRes = await runLocal(manager, 'AccessCard1', 'getRole', {})
    assert.deepStrictEqual(accessCard1RoleRes.my_role, SUPERADMIN)
    // Dont throw error because onBound() will catch this and rollback updates
    await manager.contracts['AccessCard2'].runContract('grantRole', { role: USER, targetAddress: manager.contracts['AccessCard1'].address }, keysForAccessCard2)
    // check that third AccessCard role has not been changed
    const accessCard1RoleAfterRes = await runLocal(manager, 'AccessCard1', 'getRole', {})
    assert.deepStrictEqual(accessCard1RoleRes.my_role, accessCard1RoleAfterRes.my_role)

    // ========== case 2: try to grant USER by ADMIN to another ADMIN ==========
    // Dont throw error because onBound() will catch this and rollback updates
    await manager.contracts['AccessCard2'].runContract('grantRole', { role: USER, targetAddress: manager.contracts['AccessCard3'].address }, keysForAccessCard2)
    // check that third AccessCard role has not been changed
    const accessCard3RoleAfterRes = await runLocal(manager, 'AccessCard3', 'getRole', {})
    assert.deepStrictEqual(accessCard3RoleRes.my_role, accessCard3RoleAfterRes.my_role)
  })

  it('Test: deactivateHimself - should deactivate (set role to USER)', async function () {
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2')
    const keysForAccessCard3 = await deployAccessCardFromAccessController('AccessCard3')
    await manager.giveToAddress(manager.contracts['AccessCard1'].address)
    await manager.giveToAddress(manager.contracts['AccessCard2'].address)
    await manager.giveToAddress(manager.contracts['AccessCard3'].address)
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', { accessCardAddress: manager.contracts['AccessCard1'].address })

    // grant ADMIN to second AccessCard by first AccessCard
    await manager.contracts['AccessCard1'].runContract('grantRole', { role: ADMIN, targetAddress: manager.contracts['AccessCard2'].address }, keysForAccessCard1)
    // check that role was changed
    const accessCard2RoleRes = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(accessCard2RoleRes.my_role, ADMIN)

    // grant MODERATOR to third AccessCard by second AccessCard
    await manager.contracts['AccessCard2'].runContract('grantRole', { role: MODERATOR, targetAddress: manager.contracts['AccessCard3'].address }, keysForAccessCard2)
    // check that role was changed
    const accessCard3RoleRes = await runLocal(manager, 'AccessCard3', 'getRole', {})
    assert.deepStrictEqual(accessCard3RoleRes.my_role, MODERATOR)

    // case 1: deactivate by ADMIN
    await manager.contracts['AccessCard2'].runContract('deactivateHimself', {}, keysForAccessCard2)
    const accessCard2RoleAfterRes = await runLocal(manager, 'AccessCard2', 'getRole', {})
    assert.deepStrictEqual(accessCard2RoleAfterRes.my_role, USER)

    // case 2: deactivate by MODERATOR
    await manager.contracts['AccessCard3'].runContract('deactivateHimself', {}, keysForAccessCard3)
    const accessCard3RoleAfterRes = await runLocal(manager, 'AccessCard3', 'getRole', {})
    assert.deepStrictEqual(accessCard3RoleAfterRes.my_role, USER)
  })

  it('Test: deactivateHimself - should throw error exception if try to deactivate deactivated AccessCard (by `USER`)', async function () {
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')

    let error
    await manager.contracts['AccessCard1'].runContract('deactivateHimself', {}, keysForAccessCard1).catch(e => { error = e })
    assert.deepStrictEqual(error.data.exit_code, 109)
    // check that role has not been changed
    const accessCard1RoleAfterRes = await runLocal(manager, 'AccessCard1', 'getRole', {})
    assert.deepStrictEqual(accessCard1RoleAfterRes.my_role, USER)
  })

  it('Test: deactivateHimself - should throw error exception if try to deactivate by `SUPERADMIN`', async function () {
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1')
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].runContract('grantSuperAdminRole', { accessCardAddress: manager.contracts['AccessCard1'].address })

    let error
    await manager.contracts['AccessCard1'].runContract('deactivateHimself', {}, keysForAccessCard1).catch(e => { error = e })
    assert.deepStrictEqual(error.data.exit_code, 106)
    // check that role has not been changed
    const accessCard1RoleAfterRes = await runLocal(manager, 'AccessCard1', 'getRole', {})
    assert.deepStrictEqual(accessCard1RoleAfterRes.my_role, SUPERADMIN)
  })
})
