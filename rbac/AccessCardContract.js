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
