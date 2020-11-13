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
    imageBase64: 'te6ccgECIQEABWEAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAib/APSkICLAAZL0oOGK7VNYMPShCAQBCvSkIPShBQIDzkAHBgA332omhp/+mf6YBqab/8Nnw1/DU//DD8M3wx/DFAA9/8IWRl//wh54Wf/CNnhYB8JXwl/CYvEGZlv+dk9qpAIBIAsJAeD/fyHtRNAg10nCAY4Y0//TP9MA1NN/+Gz4a/hqf/hh+Gb4Y/hijkX0BcjJ+Gpw+GuNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4bHABgED0DvK91wv/+GJw+GNw+GZ/+GHi0wABCgCqjhKBAgDXGCD5AVj4QiD4ZfkQ8qje0z8Bjh74QyG5IJ8wIPgjgQPoqIIIG3dAoLnekvhj4IA08jTY0x8hwQMighD////9vLGS8jzgAfAB+EdukvI83gIBIA8MAQm9Eix8RA0B/PhBbo5q7UTQINdJwgGOGNP/0z/TANTTf/hs+Gv4an/4Yfhm+GP4Yo5F9AXIyfhqcPhrjQhgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE+GxwAYBA9A7yvdcL//hicPhjcPhmf/hh4t74RvJzcfhm1NN/0fgAIQ4AHvhqIPhr+Cj4bFvwB3/4ZwIBIBwQAgEgFxECASATEgC3tkc2aT4QW6S8Aje+kD6QZXU0dD6QN/RIPhMIccF8uBk+ACNBlPbmx5IGJ5IGFub3RoZXIgY29udHJhY3RzgyM7J+EL4RSBukjBw3r3y6Gf4ACL4bF8D8Ad/+GeABCbe6kltgFAH4+EFukvAI3tP/0Y0IYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPgA+EoiIdDIIdMAM8AAk3HPQJpxz0Eh0x8zzwsf4iHTADPAAJNxz0Cacc9BIdMBM88LAeIh0wAzwACTcc9AmHHPQSHUM88U4iHTADPDARUB/JSAN/Lw3nHPQcgjzwv/ItQ00PQEASJwIoBA9EMxIMj0ACDJJcw1JdMAN8AAlSRxz0A1myRxz0E1JdQ3Jcw14iTJCF8IICD5AIEEAMjLCiHPC//J0DH4SyHIz4WIzgH6AoBpz0DPg8+DIs8Uz4PIz5Bsu5Ly+CjPFibPC//4TBYAes8W+ErPFM3JcfsAMQNfAyHA/44iI9DTAfpAMDHIz4cgzoBgz0DPgc+Bz5LbqSW2Ic8WyXH7AN4w8Ad/+GcCAVgbGAEJtBGctcAZAfz4QW6S8Aje+kDRi/T25seSBmb3Igb3duZXJzjIzsn4QvhFIG6SMHDeuvLoZvgAjQhU3VwZXJhZG1pbiBhbHJlYWR5IGNyZWF0ZWQgZWFybGVygyM7J+Ez4KMcF8uhl+AAg+GwgyM+FiM6NBA5iWgAAAAAAAAAAAAAAAAABzxYaACjPgc+Bz5HEJwv6yXH7ADDwB3/4ZwCFtKGmHfwgt0l4BG9o/AB8JhDgf8cREehpgP0gGBjkZ8OQZ0AwZ6BnwOfA58lShph3EOeLZLj9gG8YYH/JeAPvP/wzwAIBIB4dAHe49+R5/wgt0l4BG9pv+jF+ntzY8kDM3uRA3u7cyuTnGRnZPwhfCKQN0kYOG9deXQzfAAQfDWYeAO//DPACASAgHwCHt2QYcn4QW6S8Aje0fgA+EshwP+OIyPQ0wH6QDAxyM+HIM6AYM9Az4HPgc+SNkGHJiHPC3/JcfsA3jDA/5LwB95/+GeAAattwItDWAjHSADDcIccAkOAh1w0fkvI84VMRkOHBAyKCEP////28sZLyPOAB8AH4R26S8jze',
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
