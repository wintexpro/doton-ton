/**
 * Run this tests from root directory: `ton-env test -p ./tests/rbac/rbac.test.js`
 */

const fs = require('fs');

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
    // await manager.GiveToAddress(manager.contracts['AccessController'].address);
  });

  const accessCardAbiPath = '/home/denis/Разное/TON/WintexFreeTonContractsRepository/contracts/rbac/AccessCard.abi.json';
  
  /**
   * Deploy AccessCard from AccessController
   */
  async function deployAccessCardFromAccessController(contractName) {
    const keyPair = await manager.createKeysAndReturn();
    const deployAccessCardRes = await manager.contracts['AccessController'].RunContract('deployAccessCardWithPubkey', {
      pubkey: '0x' + keyPair.public,
    });
    manager.AddContractFromAddress(deployAccessCardRes.deployedContract, accessCardAbiPath, contractName); // add contract to manager
    return keyPair;
  }

  it('Test: grantSuperAdmin - forbid call by not contract with `accessControllerAddress`', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true);

    let error;
    await manager.contracts['AccessCard1'].RunContract('grantSuperAdmin', {}, keysForAccessCard1).catch(e => error = e);
    assert.deepStrictEqual(error.data.exit_code, 107);
  });

  it('Test: grantSuperAdmin - Calling from AccessController should change role on `SUPERADMIN`', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true);
    const getRoleBeforeGrantingRes = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1);
    assert.deepStrictEqual(fromHexWith0x(getRoleBeforeGrantingRes.my_role), 'USER');

    /* // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2');
    assert.deepStrictEqual(manager.contracts['AccessCard2'].isDeployed, true); */

    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address,
    });

    const getRoleAfterGrantingRes = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1);
    assert.deepStrictEqual(fromHexWith0x(getRoleAfterGrantingRes.my_role), 'SUPERADMIN');
  });

  it('Test: grantRole - should change role by superadmin to another user', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true);
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address,
    });

    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2');
    assert.deepStrictEqual(manager.contracts['AccessCard2'].isDeployed, true);
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

  it('Test: grantRole - should throw exception if try to grant role by himself', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true);
    // --- Grant first superadmin ---
    await manager.contracts['AccessController'].RunContract('grantSuperAdminRole', {
      accessCardAddress: manager.contracts['AccessCard1'].address,
    });

    // get role before change
    const getRoleBeforeGrantingRes = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1);
    assert.deepStrictEqual(fromHexWith0x(getRoleBeforeGrantingRes.my_role), 'USER');

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

  it('Test: grantRole - should throw exception if try to grant role by not current AccessCard owner', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true);
    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2');
    assert.deepStrictEqual(manager.contracts['AccessCard2'].isDeployed, true);
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

  it('Test: grantRole - should throw exception if contract has not role `ADMIN` or `SUPERADMIN`. Case 1: Contract role is `USER`', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true);
    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2');
    assert.deepStrictEqual(manager.contracts['AccessCard2'].isDeployed, true);

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

  it('Test: grantRole - should throw exception if contract has not role `ADMIN` or `SUPERADMIN`. Case 2: Contract role is `MODERATOR`', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true);
    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2');
    assert.deepStrictEqual(manager.contracts['AccessCard2'].isDeployed, true);
    // --- Deployment the third AccessCard ---
    const keysForAccessCard3 = await deployAccessCardFromAccessController('AccessCard3');
    assert.deepStrictEqual(manager.contracts['AccessCard3'].isDeployed, true);
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

  it('Test: grantRole - should throw exception if try to grant incorrect role', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true);
    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2');
    assert.deepStrictEqual(manager.contracts['AccessCard2'].isDeployed, true);
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


  it.only('Test: grantRole - should not change target role if you can not grant this role', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true);
    // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2');
    assert.deepStrictEqual(manager.contracts['AccessCard2'].isDeployed, true);
    // --- Deployment the third AccessCard ---
    const keysForAccessCard3 = await deployAccessCardFromAccessController('AccessCard3');
    assert.deepStrictEqual(manager.contracts['AccessCard3'].isDeployed, true);
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

    // ========== case 1: ==========

    // check that third AccessCard role has not been changed
    const accessCard3RoleRes = await manager.contracts['AccessCard3'].RunContract('getRole', {}, keysForAccessCard3);
    assert.deepStrictEqual(fromHexWith0x(accessCard3RoleRes.my_role), 'USER');
    // TODO ДА Я ХЗ !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // TODO почему-то где-то не хватает баланса. разобраться в понедельник
    // try to grant SUPERADMIN by ADMIN. Dont throw error because onBound() will catch this and rollback updates
    manager.GiveToAddress(manager.contracts['AccessCard1'].address);
    manager.GiveToAddress(manager.contracts['AccessCard2'].address);
    manager.GiveToAddress(manager.contracts['AccessCard3'].address);
    await manager.contracts['AccessCard2'].RunContract(
      'grantRole',
      { role: toHex('SUPERADMIN'), targetAddress: manager.contracts['AccessCard3'].address  },
      keysForAccessCard2
    );

    // check that third AccessCard role has not been changed
    const accessCard3RoleAfterRes = await manager.contracts['AccessCard3'].RunContract('getRole', {}, keysForAccessCard3);
    assert.deepStrictEqual(fromHexWith0x(accessCard3RoleRes.my_role), fromHexWith0x(accessCard3RoleAfterRes.my_role));
  });

  it('Test: hasRole - should return correct value', async function() {
    // --- Deployment the first AccessCard ---
    const keysForAccessCard1 = await deployAccessCardFromAccessController('AccessCard1');
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true);
    // check that getRole return USER
    const accessCard1_role = await manager.contracts['AccessCard1'].RunContract('getRole', {}, keysForAccessCard1);
    assert.equal(fromHexWith0x(accessCard1_role.my_role), 'USER');

    /* // --- Deployment the second AccessCard ---
    const keysForAccessCard2 = await deployAccessCardFromAccessController('AccessCard2');
    assert.deepStrictEqual(manager.contracts['AccessCard1'].isDeployed, true);
    // check that getRole return USER
    const accessCard2_role = await manager.contracts['AccessCard2'].RunContract('getRole', {}, keysForAccessCard2);
    assert.equal(fromHexWith0x(accessCard2_role.my_role), 'USER'); */
  });
});

function fromHexWith0x(_string) {
  return Buffer.from(_string.substring(2), 'hex').toString('utf8')
}

function toHex(_string, isWith0x = true) {
  return (isWith0x ? '0x' : '') + Buffer.from(_string, 'utf8').toString('hex')
}

