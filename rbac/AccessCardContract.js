//
// This file was generated using TON Labs developer tools.
//

const abi = {
	"ABI version": 2,
	"header": ["time"],
	"functions": [
		{
			"name": "constructor",
			"inputs": [
				{"name":"_accessControllerAddress","type":"address"},
				{"name":"_myPublicKey","type":"uint256"},
				{"name":"_superAdminAddress","type":"address"},
				{"name":"_myInitState","type":"cell"}
			],
			"outputs": [
			]
		},
		{
			"name": "test",
			"inputs": [
				{"name":"role","type":"uint256"}
			],
			"outputs": [
				{"name":"p1","type":"bool"},
				{"name":"p2","type":"bool"},
				{"name":"p3","type":"bool"},
				{"name":"input_param","type":"uint256"},
				{"name":"_s","type":"uint256"},
				{"name":"equal_s","type":"bool"}
			]
		},
		{
			"name": "getInfo",
			"inputs": [
			],
			"outputs": [
				{"name":"info_accessControllerAddress","type":"address"},
				{"name":"info_superAdminAddress","type":"address"},
				{"name":"info_myPublicKey","type":"uint256"},
				{"name":"info_myRole","type":"uint256"}
			]
		},
		{
			"name": "grantSuperAdmin",
			"inputs": [
			],
			"outputs": [
			]
		},
		{
			"name": "getRole",
			"inputs": [
			],
			"outputs": [
				{"name":"my_role","type":"uint256"}
			]
		},
		{
			"name": "hasRole",
			"inputs": [
				{"name":"role","type":"uint256"}
			],
			"outputs": [
				{"name":"value0","type":"bool"}
			]
		},
		{
			"name": "grantRole",
			"inputs": [
				{"name":"role","type":"uint256"},
				{"name":"targetAddress","type":"address"}
			],
			"outputs": [
			]
		},
		{
			"name": "changeRole",
			"inputs": [
				{"name":"initiatiorRole","type":"uint256"},
				{"name":"role","type":"uint256"},
				{"name":"touchingPublicKey","type":"uint256"}
			],
			"outputs": [
			]
		},
		{
			"name": "deactivateHimself",
			"inputs": [
			],
			"outputs": [
			]
		}
	],
	"data": [
		{"key":1,"name":"roles","type":"map(uint256,bool)"}
	],
	"events": [
	]
};

const pkg = {
    abi,
    imageBase64: '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',
};

class AccessCardContract {
    /**
    * @param {TONClient} client
    * @param {string} address can be null if contract will be deployed
    * @param {TONKeyPairData} keys
    */
    constructor(client, address, keys) {
        this.client = client;
        this.address = address;
        this.keys = keys;
        this.package = pkg;
        this.abi = abi;
    }

    /**
     * @param {object} constructorParams
     * @param {string} constructorParams._accessControllerAddress (address)
     * @param {string} constructorParams._myPublicKey (uint256)
     * @param {string} constructorParams._superAdminAddress (address)
     * @param {cell} constructorParams._myInitState
     * @param {object} initParams
     * @param {map(uint256,bool)} initParams.roles
     */
    async deploy(constructorParams, initParams) {
        if (!this.keys) {
            this.keys = await this.client.crypto.ed25519Keypair();
        }
        this.address = (await this.client.contracts.deploy({
            package: pkg,
            constructorParams,
            initParams,
            keyPair: this.keys,
        })).address;
    }

    /**
    * @param {string} functionName
    * @param {object} input
    * @return {Promise.<object>}
    */
    async run(functionName, input) {
        const result = await this.client.contracts.run({
            address: this.address,
            functionName,
            abi,
            input,
            keyPair: this.keys,
        });
        return result.output;
    }

   /**
    * @param {string} functionName
    * @param {object} input
    * @return {Promise.<object>}
    */
    async runLocal(functionName, input) {
        const result = await this.client.contracts.runLocal({
            address: this.address,
            functionName,
            abi,
            input,
            keyPair: this.keys,
        });
        return result.output;
    }

    /**
     * @typedef AccessCardContract_test
     * @type {object}
     * @property {bool} p1 
     * @property {bool} p2 
     * @property {bool} p3 
     * @property {string} input_param  (uint256)
     * @property {string} _s  (uint256)
     * @property {bool} equal_s 
     */

    /**
     * @param {object} params
     * @param {string} params.role (uint256)
     * @return {Promise.<AccessCardContract_test>}
     */
    test(params) {
        return this.run('test', params);
    }

    /**
     * @param {object} params
     * @param {string} params.role (uint256)
     * @return {Promise.<AccessCardContract_test>}
     */
    testLocal(params) {
        return this.runLocal('test', params);
    }

    /**
     * @typedef AccessCardContract_getInfo
     * @type {object}
     * @property {string} info_accessControllerAddress  (address)
     * @property {string} info_superAdminAddress  (address)
     * @property {string} info_myPublicKey  (uint256)
     * @property {string} info_myRole  (uint256)
     */

    /**
     * @return {Promise.<AccessCardContract_getInfo>}
     */
    getInfo() {
        return this.run('getInfo', {});
    }

    /**
     * @return {Promise.<AccessCardContract_getInfo>}
     */
    getInfoLocal() {
        return this.runLocal('getInfo', {});
    }

    /**
     */
    grantSuperAdmin() {
        return this.run('grantSuperAdmin', {});
    }

    /**
     */
    grantSuperAdminLocal() {
        return this.runLocal('grantSuperAdmin', {});
    }

    /**
     * @typedef AccessCardContract_getRole
     * @type {object}
     * @property {string} my_role  (uint256)
     */

    /**
     * @return {Promise.<AccessCardContract_getRole>}
     */
    getRole() {
        return this.run('getRole', {});
    }

    /**
     * @return {Promise.<AccessCardContract_getRole>}
     */
    getRoleLocal() {
        return this.runLocal('getRole', {});
    }

    /**
     * @typedef AccessCardContract_hasRole
     * @type {object}
     * @property {bool} value0 
     */

    /**
     * @param {object} params
     * @param {string} params.role (uint256)
     * @return {Promise.<AccessCardContract_hasRole>}
     */
    hasRole(params) {
        return this.run('hasRole', params);
    }

    /**
     * @param {object} params
     * @param {string} params.role (uint256)
     * @return {Promise.<AccessCardContract_hasRole>}
     */
    hasRoleLocal(params) {
        return this.runLocal('hasRole', params);
    }

    /**
     * @param {object} params
     * @param {string} params.role (uint256)
     * @param {string} params.targetAddress (address)
     */
    grantRole(params) {
        return this.run('grantRole', params);
    }

    /**
     * @param {object} params
     * @param {string} params.role (uint256)
     * @param {string} params.targetAddress (address)
     */
    grantRoleLocal(params) {
        return this.runLocal('grantRole', params);
    }

    /**
     * @param {object} params
     * @param {string} params.initiatiorRole (uint256)
     * @param {string} params.role (uint256)
     * @param {string} params.touchingPublicKey (uint256)
     */
    changeRole(params) {
        return this.run('changeRole', params);
    }

    /**
     * @param {object} params
     * @param {string} params.initiatiorRole (uint256)
     * @param {string} params.role (uint256)
     * @param {string} params.touchingPublicKey (uint256)
     */
    changeRoleLocal(params) {
        return this.runLocal('changeRole', params);
    }

    /**
     */
    deactivateHimself() {
        return this.run('deactivateHimself', {});
    }

    /**
     */
    deactivateHimselfLocal() {
        return this.runLocal('deactivateHimself', {});
    }

}

AccessCardContract.package = pkg;

module.exports = AccessCardContract;
