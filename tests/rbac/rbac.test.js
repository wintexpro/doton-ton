/**
 * Run this tests from root directory: `ton-env test -p ./tests/rbac/rbac.test.js`
 */

// const { assert } = require('console');
const fs = require('fs');

describe('Asserts', function() {
  let manager;
  beforeEach(async function() {
    manager = new Manager();
    await manager.CreateClient(['http://localhost:80/graphql']);
    await manager.createKeys();
    manager.loadContract(
      '/home/denis/Разное/TON/WintexFreeTonContractsRepository/contracts/rbac/AccessController.tvc',
      '/home/denis/Разное/TON/WintexFreeTonContractsRepository/contracts/rbac/AccessController.abi.json'
    );
    manager.loadContract(
      '/home/denis/Разное/TON/WintexFreeTonContractsRepository/contracts/rbac/AccessCard.tvc',
      '/home/denis/Разное/TON/WintexFreeTonContractsRepository/contracts/rbac/AccessCard.abi.json'
    );
    await manager.contracts['AccessController'].DeployContract({
      _accessCardInitState: fs.readFileSync('/home/denis/Разное/TON/WintexFreeTonContractsRepository/contracts/rbac/AccessCard.tvc', { encoding: 'base64' }),
      _initialValue: 1000000
    });
  });

  it('test one', async function() {
    const accessCardAbiPath = '/home/denis/Разное/TON/WintexFreeTonContractsRepository/contracts/rbac/AccessCard.abi.json';

    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await manager.createKeysAndReturn();
    const deployAccessCard1Res = await manager.contracts['AccessController'].RunContract('deployAccessCardWithPubkey', {
      pubkey: '0x' + keysForAccessCard1.public,
    });
    manager.AddContractFromAddress(deployAccessCard1Res.deployedContract, accessCardAbiPath, 'AccessCard1'); // add contract (first AccessCard) to manager
    manager.GiveToAddress(manager.contracts['AccessCard1'].address);
    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await manager.createKeysAndReturn();
    const deployAccessCard2Res = await manager.contracts['AccessController'].RunContract('deployAccessCardWithPubkey', {
      pubkey: '0x' + keysForAccessCard2.public,
    });
    manager.AddContractFromAddress(deployAccessCard2Res.deployedContract, accessCardAbiPath, 'AccessCard2'); // add contract (first AccessCard) to manager
    manager.GiveToAddress(manager.contracts['AccessCard2'].address);
    // call getInfo from first AccessCard
    let accessCard1_getInfo = await manager.contracts['AccessCard1'].RunContract('getInfo', {}, keysForAccessCard1);
    assert.equal(fromHexWith0x(accessCard1_getInfo.info_myRole), 'USER'); // check that myRole is USER
    // call getInfo from second AccessCard
    let accessCard2_getInfo = await manager.contracts['AccessCard2'].RunContract('getInfo', {}, keysForAccessCard2);
    assert.equal(fromHexWith0x(accessCard2_getInfo.info_myRole), 'USER'); // check that myRole is USER

    // --- Grant first superadmin ---
    // add contract (first AccessController) to manager
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: deployAccessCard1Res.deployedContract,
    });
    // check that role changed in accessCard1
    let accessCard1_getInfo_after_first_granting_a_superadmin = await manager.contracts['AccessCard1'].RunContract('getInfo', {}, keysForAccessCard1);
    const role_after_first_granting_a_superadmin = fromHexWith0x(accessCard1_getInfo_after_first_granting_a_superadmin.info_myRole);
    assert.equal(role_after_first_granting_a_superadmin, 'SUPERADMIN');
    // check that superAdminAddress changed in AccessController
    let accessController_getInfo_after_first_granting_a_superadmin = await manager.contracts['AccessController'].RunContract('getInfo', {});
    assert.equal(accessController_getInfo_after_first_granting_a_superadmin.info_superAdminAddress, deployAccessCard1Res.deployedContract);

    // --- change superadmin (grant superadmin to second AccessCard) ---
    /* const hasRoleRes = await manager.contracts['AccessCard1'].RunContract('hasRole', { role: toHexWith0x('SUPERADMIN') }, keysForAccessCard1)
    console.log('hasRoleRes:', hasRoleRes);

    const r = await manager.contracts['AccessCard1'].RunContract('test', { role: toHexWith0x('SUPERADMIN') }, keysForAccessCard1)
    console.log('r::', r, toHexWith0x('SUPERADMIN')); */

    await manager.contracts['AccessCard1'].RunContract(
      'grantRole',
      { role: toHex('SUPERADMIN'), targetAddress: deployAccessCard2Res.deployedContract },
      keysForAccessCard1
    );
    let accessCard1_getInfo_after_change_superadmin = await manager.contracts['AccessCard1'].RunContract('getInfo', {}, keysForAccessCard1);
    assert.equal(fromHexWith0x(accessCard1_getInfo_after_change_superadmin.info_myRole), 'USER', 'Superadmin not changed himself role');
    let accessCard2_getInfo_after_change_superadmin = await manager.contracts['AccessCard2'].RunContract('getInfo', {}, keysForAccessCard2);
    assert.equal(fromHexWith0x(accessCard2_getInfo_after_change_superadmin.info_myRole), 'SUPERADMIN', 'Superadmin not changed target role');
  });
});


function fromHexWith0x(_string) {
  return Buffer.from(_string.substring(2), 'hex').toString('utf8')
}

function toHex(_string, isWith0x = true) {
  return (isWith0x ? '0x' : '') + Buffer.from(_string, 'utf8').toString('hex')
}

