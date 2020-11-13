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
