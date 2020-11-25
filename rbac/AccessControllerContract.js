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
				{"name":"oldSuperAdminAddress","type":"address"},
				{"name":"value2","type":"uint256"}
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
    imageBase64: 'te6ccgECIQEABUAAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAib/APSkICLAAZL0oOGK7VNYMPShCAQBCvSkIPShBQIJnwAAAAMHBgA3O1E0NP/0z/TANTTf/hs+Gv4an/4Yfhm+GP4YoAA9PhCyMv/+EPPCz/4Rs8LAPhK+Ev4TF4gzMt/zsntVIAIBIAsJAeD/fyHtRNAg10nCAY4Y0//TP9MA1NN/+Gz4a/hqf/hh+Gb4Y/hijkX0BcjJ+Gpw+GuNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4bHABgED0DvK91wv/+GJw+GNw+GZ/+GHi0wABCgCqjhKBAgDXGCD5AVj4QiD4ZfkQ8qje0z8Bjh74QyG5IJ8wIPgjgQPoqIIIG3dAoLnekvhj4IA08jTY0x8hwQMighD////9vLGS8jzgAfAB+EdukvI83gIBIA8MAQm9Eix8RA0B/PhBbo5q7UTQINdJwgGOGNP/0z/TANTTf/hs+Gv4an/4Yfhm+GP4Yo5F9AXIyfhqcPhrjQhgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE+GxwAYBA9A7yvdcL//hicPhjcPhmf/hh4t74RvJzcfhm1NN/0fgAIQ4AHvhqIPhr+Cj4bFvwAn/4ZwIBIBoQAgEgFREBCbjdSS2wEgH4+EFukvAD3tP/0Y0IYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABPgA+EoiIdDIIdMAM8AAk3HPQJpxz0Eh0x8zzwsf4iHTADPAAJNxz0Cacc9BIdMBM88LAeIh0wAzwACTcc9AmHHPQSHUM88U4iHTADPDARMB/JSAN/Lw3nHPQcgjzwv/ItQ00PQEASJwIoBA9EMxIMj0ACDJJcw1JdMAN8AAlSRxz0A1myRxz0E1JdQ3Jcw14iTJCF8IICD5AMjPigBAy//J0PhLIcjPhYjOAfoCgGnPQM+Dz4MizxTPg8jPkGy7kvL4KM8WJs8L//hMzxb4ShQAcs8Uzclx+wAxA18DIcD/jiIj0NMB+kAwMcjPhyDOgGDPQM+Bz4HPktupJbYhzxbJcfsA3jDwAn/4ZwIBWBkWAQm0EZy1wBcB/PhBbpLwA976QNGL9Pbmx5IGZvciBvd25lcnOMjOyfhC+EUgbpIwcN668uhm+ACNCFTdXBlcmFkbWluIGFscmVhZHkgY3JlYXRlZCBlYXJsZXKDIzsn4TPgoxwXy6GX4ACD4bCDIz4WIzo0EDmJaAAAAAAAAAAAAAAAAAAHPFhgAKM+Bz4HPkcQnC/rJcfsAMPACf/hnAIG0oaYd/CC3SXgB72j8AHwmEOB/xxER6GmA/SAYGORnw5BnQDBnoGfA58DnyVKGmHcQ54tkuP2AbxhJeAFvP/wzwAIBIBwbAHe49+R5/wgt0l4Ae9pv+jF+ntzY8kDM3uRA3u7cyuTnGRnZPwhfCKQN0kYOG9deXQzfAAQfDWYeAE//DPACASAeHQCDt2QYcn4QW6S8APe0fgA+EshwP+OIyPQ0wH6QDAxyM+HIM6AYM9Az4HPgc+SNkGHJiHPC3/JcfsA3jCS8ALef/hngAgEgIB8AjbU/O4v8ILdJeAHvfSB9IMrqaOh9IG/rhv/K6mjoaf/v6JD8JhDjgvlwNHwAfCF8IpA3SRg4b175cDP8ABH8Ni+CeAE//DPAAFzacCLQ1wsDqTgA3CHHANwh0x8h3SHBAyKCEP////28sZLyPOAB8AH4R26S8jze',
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
     * @param {string} params.value2 (uint256)
     */
    changeAdmin(params) {
        return this.run('changeAdmin', params);
    }

    /**
     * @param {object} params
     * @param {string} params.newSuperAdminAddress (address)
     * @param {string} params.oldSuperAdminAddress (address)
     * @param {string} params.value2 (uint256)
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
