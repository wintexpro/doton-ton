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
