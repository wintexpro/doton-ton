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
