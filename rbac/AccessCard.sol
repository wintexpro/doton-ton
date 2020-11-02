pragma solidity >= 0.6.0;

abstract contract IAccessCard {
    function touchMe(uint256 pubkey) public virtual;
}

contract AccessCard {
    uint256 accessControllerPublicKey;
    uint256 myPublicKey;
    TvmCell myInitState;
    uint256 touched = 0;
    address lastTouched;

    mapping (uint8 => bytes32) public roles;
    
    /*
     * Проверяет, что вызываемый текущим контрактом контракт имеет такой же init state
     */
    modifier isSameWallet(uint256 touchingPublicKey) {
        tvm.accept();
        TvmCell sendersStateInit = tvm.insertPubkey(myInitState, touchingPublicKey);
        require (msg.sender.value == tvm.hash(sendersStateInit));
        _;
    }

    constructor(uint256 _accessControllerPublicKey, uint256 _myPublicKey, TvmCell _myInitState) public {
        tvm.accept();
        rootRbacPublicKey = _accessControllerPublicKey;
        myPublicKey = _myPublicKey;
        myInitState = _myInitState;

        roles[1] = 'ADMIN';
        roles[2] = 'RELAYER';
    }

    function touchSome(IAccessCard target) external {
        tvm.accept();
        target.touchMe(target);
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