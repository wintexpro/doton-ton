/* eslint-disable dot-notation */
/**
 * Tests: contract AccessCards.
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
      console.log('address:', accountInfo)
      if (accountInfo.length > 0) break
    }
  }

  // cd ./rbac/ && tondev sol -l js -L deploy AccessCard.sol &&  cd ../ && ton-env test -p ./tests/rbac/rbac.AccessCard.test.js
  it.only('bounce debug', async function () {
    const managerForDev = new Manager()
    await managerForDev.createClient(['net.ton.dev'/* 'http://localhost:80/graphql' */])
    // import giver
    await managerForDev.addContractFromAddress(
      '0:440c99337a4009fec7ad4895a08587f05ab98b9d5c341dfb2211d1c862f1ae78',
      path.join(__dirname, '../../CustomGiverForDevNet/WintexGiver.abi.json'),
      'WintexGiver'
    ) // add contract to managerForDev
    const wintexGiverKeysObject = JSON.parse(fs.readFileSync(path.join(__dirname, '../../CustomGiverForDevNet/WintexGiver.keys.json')))

    // Deployment the AccessController:
    const keysForAccessController = await managerForDev.createKeysAndReturn()
    await managerForDev.loadContract(
      path.join(__dirname, '../../rbac/AccessController.tvc'),
      path.join(__dirname, '../../rbac/AccessController.abi.json'),
      { keys: keysForAccessController }
    )
    // send grams to future AccessController address
    await managerForDev.contracts['WintexGiver'].runContract(
      'sendMeGramsPls',
      {
        dest: managerForDev.contracts['AccessController'].address,
        amount: 500000000
      },
      wintexGiverKeysObject
    )
    // deploy AccessController
    await managerForDev.contracts['AccessController'].deployContract(
      {
        _accessCardInitState: fs.readFileSync(accessCardTvcPath, { encoding: 'base64' }),
        _initialValue: 100000000
      },
      false,
      keysForAccessController
    )
    await deployCheck(managerForDev.contracts['AccessController'].address, managerForDev)
    // Deployment the AccessCards
    await managerForDev.loadContract(accessCardTvcPath, accessCardAbiPath, { contractName: 'AccessCard1' })
    await managerForDev.loadContract(accessCardTvcPath, accessCardAbiPath, { contractName: 'AccessCard2' })
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1', true, managerForDev, keysForAccessController)
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2', true, managerForDev, keysForAccessController)
    console.log('AccessCard1:', managerForDev.contracts['AccessCard1'].address)
    console.log('AccessCard2:', managerForDev.contracts['AccessCard2'].address)
    // send grams to future AccessCard1 address
    /* await managerForDev.contracts['WintexGiver'].runContract(
      'sendMeGramsPls',
      {
        dest: managerForDev.contracts['AccessCard1'].address,
        amount: 2000000000
      },
      wintexGiverKeysObject
    ).catch(e => console.log('sendMeGramsPls e::', e))
    // send grams to future AccessCard2 address
    await managerForDev.contracts['WintexGiver'].runContract(
      'sendMeGramsPls',
      {
        dest: managerForDev.contracts['AccessCard2'].address,
        amount: 2000000000
      },
      wintexGiverKeysObject
    ).catch(e => console.log('sendMeGramsPls e::', e)) */
    // --- Grant first superadmin ---
    await managerForDev.contracts['AccessController'].runContract('grantSuperAdminRole', {
      accessCardAddress: managerForDev.contracts['AccessCard1'].address
    }, keysForAccessController).catch(e => console.log('grantSuperAdminRole:', e))
    await new Promise(resolve => resolve(resolve, 5000))

    // ======================================= AFTER - for debug ====================================================
    /* const getInfo1AccessCard1 = await managerForDev.contracts['AccessCard1'].runContract('getRole', {}, keysForAccessCard1).catch(e => console.log('getRole:', e))
    console.log('getInfo1AccessCard1::', getInfo1AccessCard1)
    const getInfo1AccessCard2 = await managerForDev.contracts['AccessCard2'].runContract('getRole', {}, keysForAccessCard2).catch(e => console.log('getRole:', e))
    console.log('getInfo1AccessCard2::', getInfo1AccessCard2)
    console.log('keys:', keysForAccessCard1, keysForAccessCard2) */
    // ======================================= BEFORE - for debug ====================================================

    // grant ADMIN to second AccessCard by first AccessCard
    await managerForDev.contracts['AccessCard1'].runContract(
      'grantRole',
      { role: toHex('ADMIN'), targetAddress: managerForDev.contracts['AccessCard2'].address },
      keysForAccessCard1
    ).catch(e => console.log('grantRole:', e))
    await new Promise(resolve => resolve(resolve, 10000))

    const getInfo1231 = await managerForDev.contracts['AccessCard1'].runContract('getInfo', {}, keysForAccessCard1).catch(e => console.log(e))
    console.log('AccessCard1 get info:', getInfo1231)
    const getInfo1232 = await managerForDev.contracts['AccessCard2'].runContract('getInfo', {}, keysForAccessCard2).catch(e => console.log(e))
    console.log('AccessCard2 get info:', getInfo1232)

    // check that role was changed
    /* const accessCard2RoleRes = await managerForDev.contracts['AccessCard2'].runContract('getRole', {}, keysForAccessCard2)
    assert.deepStrictEqual(fromHexWith0x(accessCard2RoleRes.my_role), 'ADMIN')
    console.log('123123123') */
  })
})
