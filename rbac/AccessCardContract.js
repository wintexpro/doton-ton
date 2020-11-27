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
				{"name":"value0","type":"uint128"},
				{"name":"value1","type":"uint256"},
				{"name":"value2","type":"uint8"}
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
				{"name":"my_role","type":"uint8"}
			]
		},
		{
			"name": "grantRole",
			"inputs": [
				{"name":"role","type":"uint8"},
				{"name":"targetAddress","type":"address"}
			],
			"outputs": [
			]
		},
		{
			"name": "changeRole",
			"inputs": [
				{"name":"initiatorRole","type":"uint8"},
				{"name":"role","type":"uint8"},
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
     */
    async deploy(constructorParams) {
        if (!this.keys) {
            this.keys = await this.client.crypto.ed25519Keypair();
        }
        this.address = (await this.client.contracts.deploy({
            package: pkg,
            constructorParams,
            initParams: {},
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
     * @property {uint128} value0 
     * @property {string} value1  (uint256)
     * @property {number} value2  (uint8)
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
     * @property {number} my_role  (uint8)
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
     * @param {object} params
     * @param {number} params.role (uint8)
     * @param {string} params.targetAddress (address)
     */
    grantRole(params) {
        return this.run('grantRole', params);
    }

    /**
     * @param {object} params
     * @param {number} params.role (uint8)
     * @param {string} params.targetAddress (address)
     */
    grantRoleLocal(params) {
        return this.runLocal('grantRole', params);
    }

    /**
     * @param {object} params
     * @param {number} params.initiatorRole (uint8)
     * @param {number} params.role (uint8)
     * @param {string} params.touchingPublicKey (uint256)
     */
    changeRole(params) {
        return this.run('changeRole', params);
    }

    /**
     * @param {object} params
     * @param {number} params.initiatorRole (uint8)
     * @param {number} params.role (uint8)
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
