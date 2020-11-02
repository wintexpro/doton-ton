pragma solidity >= 0.6.0;

import "AccessCard.sol";

/* 
 * Контракт хранит код контракта AccessCard, деплоит в сеть контракты AccessCard.
 * Формально является мостом между вызывающим AccessCard и вызываемым
 */
contract AccessController {
    TvmCell accessCardInitState;
    uint128 initialValue; // количество токенов, которое необходимо отправить, чтобы задеплоить контракт AccesCard
    uint256 myPublicKey; // AccessController public key 

    constructor (TvmCell _accessCardInitState, uint128 _initialValue/* , uint256 _myPublicKey */) public {
        tvm.accept();
        accessCardInitState = _accessCardInitState;
        initialValue = _initialValue;
        myPublicKey = tvm.pubkey();
    }

    function deployAccessCardWithPubkey(uint256 pubkey) public returns (address deployedContract) {
        tvm.accept();
		TvmCell stateInitWithKey = tvm.insertPubkey(accessCardInitState, pubkey);
		address newWallet = new RBACWallet{stateInit:stateInitWithKey, value:initialValue}(myPublicKey, pubkey, accessCardInitState);
		return newWallet;
	}

}
