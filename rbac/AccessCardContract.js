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
				{"name":"value0","type":"uint256"},
				{"name":"value1","type":"uint128"},
				{"name":"value2","type":"uint256"},
				{"name":"value3","type":"uint256"}
			]
		},
		{
			"name": "getInfoRole",
			"inputs": [
				{"name":"role","type":"uint256"}
			],
			"outputs": [
				{"name":"value0","type":"uint256"},
				{"name":"value1","type":"uint256"},
				{"name":"value2","type":"bool"},
				{"name":"value3","type":"bool"},
				{"name":"value4","type":"bool"},
				{"name":"value5","type":"bool"},
				{"name":"value6","type":"uint256"}
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
				{"name":"initiatorRole","type":"uint256"},
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
     * @property {string} value0  (uint256)
     * @property {uint128} value1 
     * @property {string} value2  (uint256)
     * @property {string} value3  (uint256)
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
     * @typedef AccessCardContract_getInfoRole
     * @type {object}
     * @property {string} value0  (uint256)
     * @property {string} value1  (uint256)
     * @property {bool} value2 
     * @property {bool} value3 
     * @property {bool} value4 
     * @property {bool} value5 
     * @property {string} value6  (uint256)
     */

    /**
     * @param {object} params
     * @param {string} params.role (uint256)
     * @return {Promise.<AccessCardContract_getInfoRole>}
     */
    getInfoRole(params) {
        return this.run('getInfoRole', params);
    }

    /**
     * @param {object} params
     * @param {string} params.role (uint256)
     * @return {Promise.<AccessCardContract_getInfoRole>}
     */
    getInfoRoleLocal(params) {
        return this.runLocal('getInfoRole', params);
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
     * @param {string} params.initiatorRole (uint256)
     * @param {string} params.role (uint256)
     * @param {string} params.touchingPublicKey (uint256)
     */
    changeRole(params) {
        return this.run('changeRole', params);
    }

    /**
     * @param {object} params
     * @param {string} params.initiatorRole (uint256)
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
