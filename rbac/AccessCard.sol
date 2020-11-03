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

    mapping(bytes32 => bool) public roles = ['ADMIN', 'RELAYER', 'DEACTIVATED']; // видимо сюда передать данные во время деплоя (короч 33 и 34 строку перенести в AccessController)
    bytes32 myRole;
    
    /*
     * Проверяет, что вызываемый текущим контрактом контракт имеет такой же init state
     */
    modifier isSameWallet(uint256 touchingPublicKey) {
        tvm.accept();
        TvmCell sendersStateInit = tvm.insertPubkey(myInitState, touchingPublicKey);
        require (msg.sender.value == tvm.hash(sendersStateInit));
        _;
    }

    // Modifier that allows public function to accept external calls only from RelayNodeF.
    modifier acceptOnlyOwner {
        require(tvm.pubkey() == msg.pubkey());
        tvm.accept();
        _;
    }

    constructor(uint256 _accessControllerPublicKey, uint256 _myPublicKey, TvmCell _myInitState, bytes32 _role) public {
        tvm.accept();
        rootRbacPublicKey = _accessControllerPublicKey;
        myPublicKey = _myPublicKey;
        myInitState = _myInitState;
        roles['ADMIN'] = true;
        roles['RELAYER'] = true;
        roles['DEACTIVATED'] = true;

        require(isRoleExists(_role), 'Incorrect role');
        myRole = _role;
    }

    function touchSome(IAccessCard target) external {
        tvm.accept();
        target.touchMe(myPublicKey);
    }

    function touchMe(uint256 touchingPublicKey) isSameWallet(touchingPublicKey) public { //ПОЧЕМУ НЕ ВЫЗВАТЬ msg.pubkey() вместо передачи ключа?
        tvm.accept();
        lastTouched = msg.sender;
    }

    function info() public returns (uint256, address) {
        tvm.accept();
        return (touched, lastTouched);
    }

    // === Work with roles: ===

    /**
     * @dev Checks that role exists
     */
    function isRoleExists(bytes32 role) public returns (bool) {
        return roles[role];
    }

    /**
     * @dev Returns current role of this AccessCard
     */
    function getRole() public returns (bytes32) {
        return myRole;
    }

    /**
     * @dev Returns `true` if `target` has been granted `role`.
     */
    function hasRole(bytes32 role, IAccessCard target) public view returns (bool) {
        return target.getRole() == role;
    }

    /**
     * @dev Grants `role` to `target`
     */
    function grantRole(bytes32 role, IAccessCard target) public {
        require(hasRole('ADMIN', msg.sender), "grantRole: Sender must be an admin to grant");
        require(tvm.pubkey() != msg.pubkey(), "grantRole: Can not grant role for himself");
        require(isRoleExists(_role), 'Incorrect role');
        target.changeRole(role, myPublicKey);
        if (role == 'ADMIN') {
            myRole = 'RELAYER';
        }
    }

    /**
     * Changes role for current AccessCard by another AccessCard
     */
    function changeRole(bytes32 role, uint256 touchingPublicKey) public isSameWallet(touchingPublicKey) {
        IAccessCard target = msg.sender.value; // TODO как вызвать метод вызываемого по touchingPublicKey?
        require(target.hasRole('ADMIN', msg.sender), "changeRole: Sender must be an admin to grant");
        require(isRoleExists(_role), 'Incorrect role');
        target._changeRole(role);
    }

    /**
     * @dev Deactivate yourself
     * - admin can not to renounce role 
     */
    function deactivateHimself() public acceptOnlyOwner() {
        require(myRole != 'ADMIN', "Admin can not to deactivate himself");
        myRole = 'DEACTIVATED';
    }

    /**
     * @dev Change role for yourself
     */
    function _changeRole(bytes32 role) private {
        require(isRoleExists(_role), 'Incorrect role');
        myRole = role;
    }

}