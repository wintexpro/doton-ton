/**
 * Tests: contract AccessCards.
 * 
 * Run this tests from root directory: `ton-env test -p ./tests/rbac/<current file name>.test.js`
 */

const fs = require('fs');
const path = require('path');
const fromHexWith0x = require('../helper').fromHexWith0x;
const toHex = require('../helper').toHex;

const accessCardAbiPath = path.join(__dirname, '../../rbac/AccessCard.abi.json');

describe('Asserts', function() {
  let manager;

  before(async function () {
    console.log('Start..');
    await restart(); // recreate and start containers
  });

  beforeEach(async function() {
    manager = new Manager();
    await manager.CreateClient(['http://localhost:80/graphql']);
    await manager.createKeys();
    manager.loadContract(
      path.join(__dirname, '../../rbac/AccessController.tvc'),
      path.join(__dirname, '../../rbac/AccessController.abi.json')
    );
    manager.loadContract(
      path.join(__dirname, '../../rbac/AccessCard.tvc'),
      path.join(__dirname, '../../rbac/AccessCard.abi.json')
    );
    await manager.contracts['AccessController'].DeployContract({
      _accessCardInitState: fs.readFileSync(path.join(__dirname, '../../rbac/AccessCard.tvc'), { encoding: 'base64' }),
      _initialValue: 1000000
    });
  });
  
  /**
   * Deploy AccessCard from AccessController
   */
  async function deployAccessCardFromAccessController(contractName, assertThatDeployed = true) {
    const keyPair = await manager.createKeysAndReturn();
    const deployAccessCardRes = await manager.contracts['AccessController'].RunContract('deployAccessCardWithPubkey', {
      pubkey: '0x' + keyPair.public,
    });
    manager.AddContractFromAddress(deployAccessCardRes.deployedContract, accessCardAbiPath, contractName); // add contract to manager
    if (assertThatDeployed) {
      assert.deepStrictEqual(manager.contracts[contractName].isDeployed, true);
    }
    return keyPair;
  }

  it('Test: grantSuperAdmin - should forbid call by not contract with `accessControllerAddress`', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');

    let error;
    await manager.contracts['AccessCard1'].RunContract('grantSuperAdmin', {}, keysForAccessCard1).catch(e => error = e);
    assert.deepStrictEqual(error.data.exit_code, 107);
  });

  it('Test: grantSuperAdmin - calling from AccessController should change role on `SUPERADMIN`', async function() {
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    const getRoleBeforeGrantingRes = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1);
    assert.deepStrictEqual(fromHexWith0x(getRoleBeforeGrantingRes.my_role), 'USER');

    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address,
    });

    const getRoleAfterGrantingRes = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1);
    assert.deepStrictEqual(fromHexWith0x(getRoleAfterGrantingRes.my_role), 'SUPERADMIN');
  });

  it('Test: grantRole (+ getRole) - should change role by superadmin to another user', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address,
    });

    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2');
    // check that role before change
    const getRoleBeforeGrantingRes = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2);
    assert.deepStrictEqual(fromHexWith0x(getRoleBeforeGrantingRes.my_role), 'USER');

    // grant ADMIN to second AccessCard
    await manager.contracts['AccessCard1'].RunContract(
      'grantRole',
      { role: toHex('ADMIN'), targetAddress: manager.contracts['AccessCard2'].address  },
      keysForAccessCard1
    );

    // check that role changed
    const getRoleAfterGrantingRes = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2);
    assert.deepStrictEqual(fromHexWith0x(getRoleAfterGrantingRes.my_role), 'ADMIN');
  });

  it('Test: grantRole (+ getRole) - should throw exception if try to grant role by himself', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address,
    });

    // get role before change
    const getRoleBeforeGrantingRes = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1);
    assert.deepStrictEqual(fromHexWith0x(getRoleBeforeGrantingRes.my_role), 'SUPERADMIN');

    // grant ADMIN to second AccessCard
    let error;
    await manager.contracts['AccessCard1'].RunContract(
      'grantRole',
      { role: toHex('ADMIN'), targetAddress: manager.contracts['AccessCard1'].address  },
      keysForAccessCard1
    ).catch(e => error = e);
    assert.deepStrictEqual(error.data.exit_code, 105)

    // check that role has not been changed
    const getRoleAfterGrantingRes = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1);
    assert.deepStrictEqual(fromHexWith0x(getRoleAfterGrantingRes.my_role), fromHexWith0x(getRoleBeforeGrantingRes.my_role));
  });

  it('Test: grantRole (+ getRole) - should throw exception if try to grant role by not current AccessCard owner', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2');
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address,
    });

    // get target AccessCard role before change
    const getRoleBeforeGrantingRes = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2);
    assert.deepStrictEqual(fromHexWith0x(getRoleBeforeGrantingRes.my_role), 'USER');

    // grant ADMIN to second AccessCard
    let error;
    await manager.contracts['AccessCard1'].RunContract(
      'grantRole',
      { role: toHex('ADMIN'), targetAddress: manager.contracts['AccessCard2'].address  },
      keysForAccessCard2
    ).catch(e => error = e);
    assert.ok((error.data.exit_code === 102) || (error.data.tip === 'Check sign keys'));

    // check that target AccessCard role has not been changed
    const getRoleAfterGrantingRes = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2);
    assert.deepStrictEqual(fromHexWith0x(getRoleAfterGrantingRes.my_role), fromHexWith0x(getRoleBeforeGrantingRes.my_role));
  });

  it('Test: grantRole (+ getRole) - should throw exception if contract has not role `ADMIN` or `SUPERADMIN`. Case 1: Contract role is `USER`', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2');

    // get target AccessCard role before change
    const getRoleBeforeGrantingRes = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2);
    assert.deepStrictEqual(fromHexWith0x(getRoleBeforeGrantingRes.my_role), 'USER');

    // grant ADMIN to second AccessCard
    let error;
    await manager.contracts['AccessCard1'].RunContract(
      'grantRole',
      { role: toHex('ADMIN'), targetAddress: manager.contracts['AccessCard2'].address  },
      keysForAccessCard1
    ).catch(e => error = e);
    assert.deepStrictEqual(error.data.exit_code, 101);

    // check that target AccessCard role has not been changed
    const getRoleAfterGrantingRes = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2);
    assert.deepStrictEqual(fromHexWith0x(getRoleAfterGrantingRes.my_role), fromHexWith0x(getRoleBeforeGrantingRes.my_role));
  });

  it('Test: grantRole (+ getRole) - should throw exception if contract has not role `ADMIN` or `SUPERADMIN`. Case 2: Contract role is `MODERATOR`', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2');
    // --- Deployment the third AccessCard ---
    const keysForAccessCard3 = await deployAccessCardFromAccessController('AccessCard3');
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address,
    });

    // grant ADMIN to second AccessCard by first AccessCard
    await manager.contracts['AccessCard1'].RunContract(
      'grantRole',
      { role: toHex('ADMIN'), targetAddress: manager.contracts['AccessCard2'].address  },
      keysForAccessCard1
    );
    // check that role was changed
    const accessCard2RoleRes = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2);
    assert.deepStrictEqual(fromHexWith0x(accessCard2RoleRes.my_role), 'ADMIN');

    // grant MODERATOR to third AccessCard by second AccessCard
    await manager.contracts['AccessCard2'].RunContract(
      'grantRole',
      { role: toHex('MODERATOR'), targetAddress: manager.contracts['AccessCard3'].address  },
      keysForAccessCard2
    );
    // check that role was changed
    const accessCard3RoleRes = await manager.contracts['AccessCard3'].RunContract('getRole', {}, keysForAccessCard3);
    assert.deepStrictEqual(fromHexWith0x(accessCard3RoleRes.my_role), 'MODERATOR');

    let error;
    // try to grant MODERATOR to second AccessCard by third AccessCard
    await manager.contracts['AccessCard3'].RunContract(
      'grantRole',
      { role: toHex('MODERATOR'), targetAddress: manager.contracts['AccessCard2'].address  },
      keysForAccessCard3
    ).catch(e => error = e);
    assert.deepStrictEqual(error.data.exit_code, 101);

    // check that third AccessCard role has not been changed
    const accessCard2RoleAfterRes = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2);
    assert.deepStrictEqual(fromHexWith0x(accessCard2RoleRes.my_role), fromHexWith0x(accessCard2RoleAfterRes.my_role));
  });

  it('Test: grantRole (+ getRole) - should throw exception if try to grant incorrect role', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2');
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address,
    });

    // get target role before change
    const getRoleBeforeGrantingRes = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2);
    assert.deepStrictEqual(fromHexWith0x(getRoleBeforeGrantingRes.my_role), 'USER');

    // try to grant incorrect to second AccessCard
    let error;
    await manager.contracts['AccessCard1'].RunContract(
      'grantRole',
      { role: toHex('INCORRECTROLE'), targetAddress: manager.contracts['AccessCard2'].address  },
      keysForAccessCard1
    ).catch(e => error = e);
    assert.deepStrictEqual(error.data.exit_code, 104)

    // check that target role has not been changed
    const getRoleAfterGrantingRes = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2);
    assert.deepStrictEqual(fromHexWith0x(getRoleAfterGrantingRes.my_role), fromHexWith0x(getRoleBeforeGrantingRes.my_role));
  });

  it('Test: grantRole (+ getRole, + onBounce) - should not change target role if you can not grant this role', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2');
    // --- Deployment the third AccessCard ---
    const keysForAccessCard3 = await deployAccessCardFromAccessController('AccessCard3');
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address,
    });

    // grant ADMIN to second AccessCard by first AccessCard
    await manager.contracts['AccessCard1'].RunContract(
      'grantRole',
      { role: toHex('ADMIN'), targetAddress: manager.contracts['AccessCard2'].address  },
      keysForAccessCard1
    );
    // check that role was changed
    const accessCard2RoleRes = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2);
    assert.deepStrictEqual(fromHexWith0x(accessCard2RoleRes.my_role), 'ADMIN');

    // ========== cases: ==========
    await manager.GiveToAddress(manager.contracts['AccessCard2'].address);
    // check third AccessCard role
    const accessCard3RoleRes = await manager.contracts['AccessCard3'].RunContract('getRole', {}, keysForAccessCard3);
    assert.deepStrictEqual(fromHexWith0x(accessCard3RoleRes.my_role), 'USER');

    // ========== case 1: try to grant ADMIN by ADMIN ==========
    // Dont throw error because onBound() will catch this and rollback updates
    await manager.contracts['AccessCard2'].RunContract(
      'grantRole',
      { role: toHex('ADMIN'), targetAddress: manager.contracts['AccessCard3'].address  },
      keysForAccessCard2
    );
    // check that third AccessCard role has not been changed
    const accessCard3RoleAfterCase1Res = await manager.contracts['AccessCard3'].RunContract('getRole', {}, keysForAccessCard3);
    assert.deepStrictEqual(fromHexWith0x(accessCard3RoleRes.my_role), fromHexWith0x(accessCard3RoleAfterCase1Res.my_role));

    // ========== case 2: try to grant SUPERADMIN by ADMIN ==========
    // Dont throw error because onBound() will catch this and rollback updates
    await manager.contracts['AccessCard2'].RunContract(
      'grantRole',
      { role: toHex('SUPERADMIN'), targetAddress: manager.contracts['AccessCard3'].address  },
      keysForAccessCard2
    );
    // check that third AccessCard role has not been changed
    const accessCard3RoleAfterCase2Res = await manager.contracts['AccessCard3'].RunContract('getRole', {}, keysForAccessCard3);
    assert.deepStrictEqual(fromHexWith0x(accessCard3RoleRes.my_role), fromHexWith0x(accessCard3RoleAfterCase2Res.my_role));  
  });

  it('Test: grantRole (+ getRole, + onBounce) - should not change target role if you can not grant this role because target role insuitable', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2');
    // --- Deployment the third AccessCard ---
    const keysForAccessCard3 = await deployAccessCardFromAccessController('AccessCard3');
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address,
    });

    await manager.GiveToAddress(manager.contracts['AccessCard1'].address);

    // grant ADMIN to second AccessCard by first AccessCard
    await manager.contracts['AccessCard1'].RunContract(
      'grantRole',
      { role: toHex('ADMIN'), targetAddress: manager.contracts['AccessCard2'].address  },
      keysForAccessCard1
    );
    // check that role was changed
    const accessCard2RoleRes = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2);
    assert.deepStrictEqual(fromHexWith0x(accessCard2RoleRes.my_role), 'ADMIN');

    // grant ADMIN to third AccessCard by first AccessCard
    await manager.contracts['AccessCard1'].RunContract(
      'grantRole',
      { role: toHex('ADMIN'), targetAddress: manager.contracts['AccessCard3'].address  },
      keysForAccessCard1
    );
    // check that role was changed
    const accessCard3RoleRes = await manager.contracts['AccessCard3'].RunContract('getRole', {}, keysForAccessCard3);
    assert.deepStrictEqual(fromHexWith0x(accessCard3RoleRes.my_role), 'ADMIN');

    // ========== cases: ==========
    await manager.GiveToAddress(manager.contracts['AccessCard2'].address);
    // ========== case 1: try to grant USER by ADMIN to SUPERADMIN==========
    // check first AccessCard role
    const accessCard1RoleRes = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1);
    assert.deepStrictEqual(fromHexWith0x(accessCard1RoleRes.my_role), 'SUPERADMIN');
    // Dont throw error because onBound() will catch this and rollback updates
    await manager.contracts['AccessCard2'].RunContract(
      'grantRole',
      { role: toHex('USER'), targetAddress: manager.contracts['AccessCard1'].address  },
      keysForAccessCard2
    );
    // check that third AccessCard role has not been changed
    const accessCard1RoleAfterRes = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1);
    assert.deepStrictEqual(fromHexWith0x(accessCard1RoleRes.my_role), fromHexWith0x(accessCard1RoleAfterRes.my_role));

    // ========== case 2: try to grant USER by ADMIN to another ADMIN ==========
    // Dont throw error because onBound() will catch this and rollback updates
    await manager.contracts['AccessCard2'].RunContract(
      'grantRole',
      { role: toHex('USER'), targetAddress: manager.contracts['AccessCard3'].address  },
      keysForAccessCard2
    );
    // check that third AccessCard role has not been changed
    const accessCard3RoleAfterRes = await manager.contracts['AccessCard3'].RunContract('getRole', {}, keysForAccessCard3);
    assert.deepStrictEqual(fromHexWith0x(accessCard3RoleRes.my_role), fromHexWith0x(accessCard3RoleAfterRes.my_role));  
  });

  it('Test: hasRole - should return correct value', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    // cases: role USER
    const case1Res = await manager.contracts['AccessCard1'].RunContract('hasRole', { role: toHex('USER') }, keysForAccessCard1);
    assert.ok(case1Res.value0);
    const case2Res = await manager.contracts['AccessCard1'].RunContract('hasRole', { role: toHex('SUPERADMIN') }, keysForAccessCard1);
    assert.deepStrictEqual(case2Res.value0, false);
    const case3Res = await manager.contracts['AccessCard1'].RunContract('hasRole', { role: toHex('ADMIN') }, keysForAccessCard1);
    assert.deepStrictEqual(case3Res.value0, false);
    const case4Res = await manager.contracts['AccessCard1'].RunContract('hasRole', { role: toHex('MODERATOR') }, keysForAccessCard1);
    assert.deepStrictEqual(case4Res.value0, false);

    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address,
    });
    // cases: role SUPERADMIN
    const case5Res = await manager.contracts['AccessCard1'].RunContract('hasRole', { role: toHex('USER') }, keysForAccessCard1);
    assert.deepStrictEqual(case5Res.value0, false);
    const case6Res = await manager.contracts['AccessCard1'].RunContract('hasRole', { role: toHex('SUPERADMIN') }, keysForAccessCard1);
    assert.ok(case6Res.value0);
    const case7Res = await manager.contracts['AccessCard1'].RunContract('hasRole', { role: toHex('ADMIN') }, keysForAccessCard1);
    assert.deepStrictEqual(case7Res.value0, false);
    const case8Res = await manager.contracts['AccessCard1'].RunContract('hasRole', { role: toHex('MODERATOR') }, keysForAccessCard1);
    assert.deepStrictEqual(case8Res.value0, false);
  });

  it('Test: deactivateHimself - should deactivate (set role to USER)', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2');
    // --- Deployment the third AccessCard ---
    const keysForAccessCard3 = await deployAccessCardFromAccessController('AccessCard3');
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address,
    });
    
    // grant ADMIN to second AccessCard by first AccessCard
    await manager.contracts['AccessCard1'].RunContract(
      'grantRole',
      { role: toHex('ADMIN'), targetAddress: manager.contracts['AccessCard2'].address  },
      keysForAccessCard1
    );
    // check that role was changed
    const accessCard2RoleRes = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2);
    assert.deepStrictEqual(fromHexWith0x(accessCard2RoleRes.my_role), 'ADMIN');
    
    // grant MODERATOR to third AccessCard by second AccessCard
    await manager.contracts['AccessCard2'].RunContract(
      'grantRole',
      { role: toHex('MODERATOR'), targetAddress: manager.contracts['AccessCard3'].address  },
      keysForAccessCard2
    );

    // check that role was changed
    const accessCard3RoleRes = await manager.contracts['AccessCard3'].RunContract('getRole', {}, keysForAccessCard3);
    assert.deepStrictEqual(fromHexWith0x(accessCard3RoleRes.my_role), 'MODERATOR');

    // case 1: deactivate by ADMIN
    await manager.contracts['AccessCard2'].RunContract('deactivateHimself', {}, keysForAccessCard2).catch(e=> console.log(e));
    const accessCard2RoleAfterRes = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2);
    assert.deepStrictEqual(fromHexWith0x(accessCard2RoleAfterRes.my_role), 'USER');

    // case 2: deactivate by MODERATOR
    await manager.contracts['AccessCard3'].RunContract('deactivateHimself', {}, keysForAccessCard3);
    const accessCard3RoleAfterRes = await manager.contracts['AccessCard3'].RunContract('getRole', {}, keysForAccessCard3);
    assert.deepStrictEqual(fromHexWith0x(accessCard3RoleAfterRes.my_role), 'USER');
  });

  it('Test: deactivateHimself - should throw error exception if try to deactivate deactivated AccessCard (by `USER`)', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');

    let error;
    await manager.contracts['AccessCard1'].RunContract('deactivateHimself', {}, keysForAccessCard1).catch(e=> error = e);
    assert.deepStrictEqual(error.data.exit_code, 109);
    // check that role has not been changed
    const accessCard1RoleAfterRes = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1);
    assert.deepStrictEqual(fromHexWith0x(accessCard1RoleAfterRes.my_role), 'USER');
  });

  it('Test: deactivateHimself - should throw error exception if try to deactivate by `SUPERADMIN`', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address,
    });

    let error;
    await manager.contracts['AccessCard1'].RunContract('deactivateHimself', {}, keysForAccessCard1).catch(e=> error = e);
    assert.deepStrictEqual(error.data.exit_code, 106);
    // check that role has not been changed
    const accessCard1RoleAfterRes = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1);
    assert.deepStrictEqual(fromHexWith0x(accessCard1RoleAfterRes.my_role), 'SUPERADMIN');
  });
});


