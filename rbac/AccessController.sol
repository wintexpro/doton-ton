pragma solidity >= 0.6.0;

import "AccessCard.sol";

contract AccessController {
    TvmCell rbacWalletInitState;
    uint128 initialValue;
    uint256 rootPublicKey;

    constructor (TvmCell _rbacWalletInitState, uint128 _initialValue, uint256 _rootPublicKey) public {
        tvm.accept();
        rbacWalletInitState = _rbacWalletInitState;
        initialValue = _initialValue;
        rootPublicKey = _rootPublicKey;
    }

    function deployWalletWithPubkey(uint256 pubkey) public returns (address deployedContract) {
        tvm.accept();
		TvmCell stateInitWithKey = tvm.insertPubkey(rbacWalletInitState, pubkey);
		address newWallet = new RBACWallet{stateInit:stateInitWithKey, value:initialValue}(rootPublicKey, pubkey, rbacWalletInitState);
		return newWallet;
	}

}
