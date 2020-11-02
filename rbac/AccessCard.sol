pragma solidity >= 0.6.0;

abstract contract IAccessCard {
    function touchMe(uint256 pubkey) public virtual;
}

contract AccessCard {
    uint256 rootRbacPublicKey;
    uint256 walletPublicKey;
    TvmCell walletInitState;
    uint256 touched = 0;
    address lastTouched;
    
    modifier isSameWallet(uint256 touchingPublicKey) {
        tvm.accept();
        TvmCell sendersStateInit = tvm.insertPubkey(walletInitState, touchingPublicKey);
        require (msg.sender.value == tvm.hash(sendersStateInit));
        _;
    }

    constructor(uint256 _rootRbacPublicKey, uint256 _walletPublicKey, TvmCell _walletInitState) public {
        tvm.accept();
        rootRbacPublicKey = _rootRbacPublicKey;
        walletPublicKey = _walletPublicKey;
        walletInitState = _walletInitState;
    }

    function touchSome(IAccessCard target) external {
        tvm.accept();
        target.touchMe(walletPublicKey);
    }

    function touchMe(uint256 touchingPublicKey) isSameWallet(touchingPublicKey) public {
        tvm.accept();
        lastTouched = msg.sender;
    }

    function info() public returns (uint256, address, uint256, uint256, uint256) {
        tvm.accept();
        return (touched, lastTouched);
    }



}