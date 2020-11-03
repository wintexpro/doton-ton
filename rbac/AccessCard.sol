pragma solidity >= 0.6.0;

abstract contract IAccessController {
    function changeAdmin(uint newSuperAdminPublicKey, uint oldSuperAdminPublicKey) external;
    function getSuperAdminPublicKey() public virtual;
}

abstract contract IAccessCard {
    function touchMe(uint256 pubkey) public virtual;
    function hasRole(bytes32 role, IAccessCard target) public virtual;
    function getRole() public virtual;
    function changeRole(bytes32 role, uint256 touchingPublicKey) public virtual;
}

contract AccessCard {
    address accessControllerAddress;
    uint256 myPublicKey;
    TvmCell myInitState;
    uint256 touched = 0;
    address lastTouched;

    mapping(bytes32 => bool) public roles = [];
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

    /**
     * Modifier that allows public function to accept external calls only from owner
     */
    modifier acceptOnlyOwner {
        require(tvm.pubkey() == msg.pubkey());
        tvm.accept();
        _;
    }

    /**
     * Only admins or superadmin can grant roles
     */
    modifier isAdminOrSuperadmin(address sender) {
        require(
            (IAccessCard(sender).hasRole('ADMIN', msg.sender) || IAccessCard(sender).hasRole('SUPERADMIN', msg.sender)),
            "Sender must be an admin or superadmin"
        );
        _;
    }

    constructor(uint256 _accessControllerAddress, uint256 _myPublicKey, TvmCell _myInitState) public {
        tvm.accept();
        accessControllerAddress = _accessControllerAddress;
        myPublicKey = _myPublicKey;
        myInitState = _myInitState;
        roles['SUPERADMIN'] = true;
        roles['ADMIN'] = true;
        roles['MODERATOR'] = true;
        roles['USER'] = true;

        if (IAccessController(accessControllerAddress).getSuperAdminPublicKey() == _myPublicKey) { // TODO так можно?
            myRole = 'SUPERADMIN';
        } else {
            myRole = 'USER';
        }
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
    function grantRole(bytes32 role, IAccessCard target) isAdminOrSuperadmin(msg.sender) external {
        require(tvm.pubkey() != msg.pubkey(), "grantRole: Can not grant role for himself"); // TODO может не нужно, если есть external?

        target.changeRole(role, myPublicKey);
        if (role == 'SUPEARDMIN') {
            myRole = 'USER';
            IAccessController(accessControllerAddress).changeAdmin(target.myPublicKey); //TODO видимо так
        }
    }

    /**
     * Changes role for current AccessCard by another AccessCard
     */
    function changeRole(bytes32 role, uint256 touchingPublicKey) isSameWallet(touchingPublicKey) isAdminOrSuperadmin(msg.sender) public {
        require(isRoleExists(role), 'Incorrect role'); // TODO Нужна ли такая проверка в grantRole (заранее == лучше?)
        if ( hasRole('ADMIN', IAccessCard(msg.sender)) ) {
            require(role == 'USER' || role == 'MODERATOR', "grantRole: Admin can not grant this role");
            require(target.hasRole('USER') || target.hasRole('MODERATOR'), "grantRole: Insuitable target role");
        } else // TODO можно объединить два условия выше в один require.
        if ( hasRole('SUPERADMIN', IAccessCard(msg.sender)) ) {
            require(role == 'USER' || role == 'ADMIN', "grantRole: Superadmin can not grant this role");
            require(target.hasRole('USER') || target.hasRole('ADMIN'), "grantRole: Insuitable target role");
        }
        // TODO Нужна ли такая проверка в grantRole (заранее == лучше?). Если нужна, то может в модификатор эти два if-а?
        // TODO Если затратно для проверок, то может переписать changeRole на отдельные методы ?
        // TODO Может ли суперадмин установить админу роль модератора? Можно сделать несколько ролей юзерам (хранить не одну роль, а, например, маппинг роль->bool)
        _changeRole(role);
    }

    /**
     * @dev Deactivate yourself
     * - superadmin can not to renounce role 
     */
    function deactivateHimself() public acceptOnlyOwner() {
        require(myRole != 'SUPERADMIN', "Superadmin can not to deactivate himself");
        myRole = 'USER';
    }

    /**
     * @dev Change role for yourself
     */
    function _changeRole(bytes32 role) private {
        require(isRoleExists(_role), 'Incorrect role');
        myRole = role;
    }

}