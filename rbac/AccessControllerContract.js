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
				{"name":"targetPubKey","type":"uint256"}
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
    imageBase64: 'te6ccgECIwEABcMAAgE0AwEBAcACAEPQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAib/APSkICLAAZL0oOGK7VNYMPShCAQBCvSkIPShBQIJnwAAAAMHBgA3O1E0NP/0z/TANTTf/hs+Gv4an/4Yfhm+GP4YoAA9PhCyMv/+EPPCz/4Rs8LAPhK+Ev4TF4gzMt/zsntVIAIBIAsJAeD/fyHtRNAg10nCAY4Y0//TP9MA1NN/+Gz4a/hqf/hh+Gb4Y/hijkX0BcjJ+Gpw+GuNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4bHABgED0DvK91wv/+GJw+GNw+GZ/+GHi0wABCgCqjhKBAgDXGCD5AVj4QiD4ZfkQ8qje0z8Bjh74QyG5IJ8wIPgjgQPoqIIIG3dAoLnekvhj4IA08jTY0x8hwQMighD////9vLGS8jzgAfAB+EdukvI83gIBIBMMAgFYEA0BCbhA9ZQwDgH++EFukvAD3vpA1w3/ldTR0NP/39EgIvhKIiHQyCHTADPAAJNxz0Cacc9BIdMfM88LH+Ih0wAzwACTcc9AmnHPQSHTATPPCwHiIdMAM8AAk3HPQJhxz0Eh1DPPFOIh0wAzwwGUgDfy8N5xz0HII88L/yLUNND0BAEicCKAQPRDMQ8AgCDI9AAgySXMNSXTADfAAJUkcc9ANZskcc9BNSXUNyXMNeIkyQhfCCGAC9ch1wv/IfkAuvLgbyT4bF8F8AJ/+GcBCbhIsfEQEQH8+EFujmrtRNAg10nCAY4Y0//TP9MA1NN/+Gz4a/hqf/hh+Gb4Y/hijkX0BcjJ+Gpw+GuNCGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAT4bHABgED0DvK91wv/+GJw+GNw+GZ/+GHi3vhG8nNx+GbU03/R+AAhEgAe+Gog+Gv4KPhsW/ACf/hnAgEgHhQCASAZFQEJuN1JLbAWAfj4QW6S8APe0//RjQhgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAE+AD4SiIh0Mgh0wAzwACTcc9AmnHPQSHTHzPPCx/iIdMAM8AAk3HPQJpxz0Eh0wEzzwsB4iHTADPAAJNxz0CYcc9BIdQzzxTiIdMAM8MBFwH8lIA38vDecc9ByCPPC/8i1DTQ9AQBInAigED0QzEgyPQAIMklzDUl0wA3wACVJHHPQDWbJHHPQTUl1DclzDXiJMkIXwggIPkAyM+KAEDL/8nQ+EshyM+FiM4B+gKAac9Az4PPgyLPFM+DyM+QbLuS8vgozxYmzwv/+EzPFvhKGAByzxTNyXH7ADEDXwMhwP+OIiPQ0wH6QDAxyM+HIM6AYM9Az4HPgc+S26kltiHPFslx+wDeMPACf/hnAgFYHRoBCbQRnLXAGwH8+EFukvAD3vpA0Yv09ubHkgZm9yIG93bmVyc4yM7J+EL4RSBukjBw3rry6Gb4AI0IVN1cGVyYWRtaW4gYWxyZWFkeSBjcmVhdGVkIGVhcmxlcoMjOyfhM+CjHBfLoZfgAIPhsIMjPhYjOjQQOYloAAAAAAAAAAAAAAAAAAc8WHAAoz4HPgc+RxCcL+slx+wAw8AJ/+GcAgbShph38ILdJeAHvaPwAfCYQ4H/HERHoaYD9IBgY5GfDkGdAMGegZ8DnwOfJUoaYdxDni2S4/YBvGEl4AW8//DPAAgEgIB8Ad7j35Hn/CC3SXgB72m/6MX6e3NjyQMze5EDe7tzK5OcZGdk/CF8IpA3SRg4b115dDN8ABB8NZh4AT/8M8AIBICIhAIO3ZBhyfhBbpLwA97R+AD4SyHA/44jI9DTAfpAMDHIz4cgzoBgz0DPgc+Bz5I2QYcmIc8Lf8lx+wDeMJLwAt5/+GeAAXNtwItDXCwOpOADcIccA3CHTHyHdIcEDIoIQ/////byxkvI84AHwAfhHbpLyPN4=',
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
     * @param {string} params.targetPubKey (uint256)
     */
    changeSuperAdmin(params) {
        return this.run('changeSuperAdmin', params);
    }

    /**
     * @param {object} params
     * @param {string} params.newSuperAdminAddress (address)
     * @param {string} params.targetPubKey (uint256)
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
