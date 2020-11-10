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
			"name": "getInfo",
			"inputs": [
			],
			"outputs": [
				{"name":"info_initialValue","type":"uint128"},
				{"name":"info_myPublicKey","type":"uint256"},
				{"name":"info_superAdminAddress","type":"address"}
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
			"name": "changeAdmin",
			"inputs": [
				{"name":"newSuperAdminAddress","type":"address"},
				{"name":"oldSuperAdminAddress","type":"address"}
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
    imageBase64: 'te6ccgECHAEABNoAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAib/APSkICLAAZL0oOGK7VNYMPShCAQBCvSkIPShBQIJnwAAAAcHBgA/O1E0NP/0z/TANTTf9P/+G34bPhr+Gp/+GH4Zvhj+GKAART4QsjL//hDzws/+EbPCwD4SvhL+Ez4TV4wzMt/y//Oye1UgAgEgCwkB7v9/Ie1E0CDXScIBjhzT/9M/0wDU03/T//ht+Gz4a/hqf/hh+Gb4Y/hijkj0BcjJ+Gpw+Gtw+GyNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4bXABgED0DvK91wv/+GJw+GNw+GZ/+GHi0wABCgCqjhKBAgDXGCD5AVj4QiD4ZfkQ8qje0z8Bjh74QyG5IJ8wIPgjgQPoqIIIG3dAoLnekvhj4IA08jTY0x8hwQMighD////9vLGS8jzgAfAB+EdukvI83gIBIA8MAQm9Eix8RA0B/vhBbo5x7UTQINdJwgGOHNP/0z/TANTTf9P/+G34bPhr+Gp/+GH4Zvhj+GKOSPQFyMn4anD4a3D4bI0IYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPhtcAGAQPQO8r3XC//4YnD4Y3D4Zn/4YeLe+Ebyc3H4ZtQOADLTf9H4ACH4aiD4a/hC+Gz4KPhtW/AGf/hnAgEgGRACASAYEQIBIBMSAF22RzZpPhBbpLwB976QPpBldTR0PpA39Eg+E0hxwXy4GT4APgAIvhtXwPwBn/4Z4AIBbhUUAPGwULSX8ILdJeAPvaLg4RoQwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACfAB8JfwmfCa2GZHgf8cWEuhpgP0gGBjkZ8OQZ0AwZ6BnwOfB5GfJblC0lxJnhb+R54X/kWeLZuS4/YBvL4Hgf8l4A28//DPAf+x1JLb8ILdJeAPvaf/oxoQwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACfAB8JREQ6GQQ6YAZ4ABJuOegTTjnoJDpj5nnhY/xEOmAGeAASbjnoE0456CQ6YCZ54WA8RDpgBngAEm456BMOOegkOoZ54pxEOmAGeGAxYB/JSAN/Lw3nHPQcgjzwv/ItQ00PQEASJwIoBA9EMxIMj0ACDJJcw1JdMAN8AAlSRxz0A1myRxz0E1JdQ3Jcw14iTJCF8IICD5AIEEAMjLCiHPC//J0DH4SyHIz4WIzgH6AoBpz0DPg8+DIs8Uz4PIz5Bsu5Ly+CjPFibPC//4TRcAes8W+ErPFM3JcfsAMQNfAyHA/44iI9DTAfpAMDHIz4cgzoBgz0DPgc+Bz5LbqSW2Ic8WyXH7AN4w8AZ/+GcApbmEZy1/CC3SXgD730gaPwhfCKQN0kYOG9deXAyfAB8ABB8NpBkZ8LEZ0aCBzEtAAAAAAAAAAAAAAAAAADni2fA58DnyOIThf1kuP2AGHgDP/wzwAgEgGxoAT7j35Hn/CC3SXgD72m/6PwhfCKQN0kYOG9deXAyfAAQfDWYeAM//DPAAatxwItDWAjHSADDcIccAkOAh1w0fkvI84VMRkOHBAyKCEP////28sZLyPOAB8AH4R26S8jze',
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
     * @typedef AccessControllerContract_getInfo
     * @type {object}
     * @property {uint128} info_initialValue 
     * @property {string} info_myPublicKey  (uint256)
     * @property {string} info_superAdminAddress  (address)
     */

    /**
     * @return {Promise.<AccessControllerContract_getInfo>}
     */
    getInfo() {
        return this.run('getInfo', {});
    }

    /**
     * @return {Promise.<AccessControllerContract_getInfo>}
     */
    getInfoLocal() {
        return this.runLocal('getInfo', {});
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
     * @param {object} params
     * @param {string} params.newSuperAdminAddress (address)
     * @param {string} params.oldSuperAdminAddress (address)
     */
    changeAdmin(params) {
        return this.run('changeAdmin', params);
    }

    /**
     * @param {object} params
     * @param {string} params.newSuperAdminAddress (address)
     * @param {string} params.oldSuperAdminAddress (address)
     */
    changeAdminLocal(params) {
        return this.runLocal('changeAdmin', params);
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
