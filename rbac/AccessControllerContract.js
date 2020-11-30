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
				{"name":"_accessCardInitState","type":"cell"},
				{"name":"_initialValue","type":"uint128"}
			],
			"outputs": [
			]
		},
		{
			"name": "getInitialValue",
			"inputs": [
			],
			"outputs": [
				{"name":"value0","type":"uint128"}
			]
		},
		{
			"name": "updateInitialValue",
			"inputs": [
				{"name":"newInitialValue","type":"uint128"}
			],
			"outputs": [
			]
		},
		{
			"name": "grantSuperAdminRole",
			"inputs": [
				{"name":"accessCardAddress","type":"address"}
			],
			"outputs": [
			]
		},
		{
			"name": "getSuperAdminAddress",
			"inputs": [
			],
			"outputs": [
				{"name":"value0","type":"address"}
			]
		},
		{
			"name": "changeSuperAdmin",
			"inputs": [
				{"name":"newSuperAdminAddress","type":"address"},
				{"name":"touchingPublicKey","type":"uint256"}
			],
			"outputs": [
			]
		},
		{
			"name": "deployAccessCardWithPubkey",
			"inputs": [
				{"name":"pubkey","type":"uint256"}
			],
			"outputs": [
				{"name":"deployedContract","type":"address"}
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

class AccessControllerContract {
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
     * @param {cell} constructorParams._accessCardInitState
     * @param {uint128} constructorParams._initialValue
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
     * @typedef AccessControllerContract_getInitialValue
     * @type {object}
     * @property {uint128} value0 
     */

    /**
     * @return {Promise.<AccessControllerContract_getInitialValue>}
     */
    getInitialValue() {
        return this.run('getInitialValue', {});
    }

    /**
     * @return {Promise.<AccessControllerContract_getInitialValue>}
     */
    getInitialValueLocal() {
        return this.runLocal('getInitialValue', {});
    }

    /**
     * @param {object} params
     * @param {uint128} params.newInitialValue
     */
    updateInitialValue(params) {
        return this.run('updateInitialValue', params);
    }

    /**
     * @param {object} params
     * @param {uint128} params.newInitialValue
     */
    updateInitialValueLocal(params) {
        return this.runLocal('updateInitialValue', params);
    }

    /**
     * @param {object} params
     * @param {string} params.accessCardAddress (address)
     */
    grantSuperAdminRole(params) {
        return this.run('grantSuperAdminRole', params);
    }

    /**
     * @param {object} params
     * @param {string} params.accessCardAddress (address)
     */
    grantSuperAdminRoleLocal(params) {
        return this.runLocal('grantSuperAdminRole', params);
    }

    /**
     * @typedef AccessControllerContract_getSuperAdminAddress
     * @type {object}
     * @property {string} value0  (address)
     */

    /**
     * @return {Promise.<AccessControllerContract_getSuperAdminAddress>}
     */
    getSuperAdminAddress() {
        return this.run('getSuperAdminAddress', {});
    }

    /**
     * @return {Promise.<AccessControllerContract_getSuperAdminAddress>}
     */
    getSuperAdminAddressLocal() {
        return this.runLocal('getSuperAdminAddress', {});
    }

    /**
     * @param {object} params
     * @param {string} params.newSuperAdminAddress (address)
     * @param {string} params.touchingPublicKey (uint256)
     */
    changeSuperAdmin(params) {
        return this.run('changeSuperAdmin', params);
    }

    /**
     * @param {object} params
     * @param {string} params.newSuperAdminAddress (address)
     * @param {string} params.touchingPublicKey (uint256)
     */
    changeSuperAdminLocal(params) {
        return this.runLocal('changeSuperAdmin', params);
    }

    /**
     * @typedef AccessControllerContract_deployAccessCardWithPubkey
     * @type {object}
     * @property {string} deployedContract  (address)
     */

    /**
     * @param {object} params
     * @param {string} params.pubkey (uint256)
     * @return {Promise.<AccessControllerContract_deployAccessCardWithPubkey>}
     */
    deployAccessCardWithPubkey(params) {
        return this.run('deployAccessCardWithPubkey', params);
    }

    /**
     * @param {object} params
     * @param {string} params.pubkey (uint256)
     * @return {Promise.<AccessControllerContract_deployAccessCardWithPubkey>}
     */
    deployAccessCardWithPubkeyLocal(params) {
        return this.runLocal('deployAccessCardWithPubkey', params);
    }

}

AccessControllerContract.package = pkg;

module.exports = AccessControllerContract;
