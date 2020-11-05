pragma solidity >= 0.6.0;

abstract contract IAccessController {
    function changeAdmin(address newSuperAdminAddress, address oldSuperAdminAddress) external virtual;
    function getSuperAdminPublicKey() public view virtual returns (uint256);
}

abstract contract IAccessCard {
    // function touchMe(uint256 pubkey) public virtual;
    function hasRole(bytes32 role) public view virtual returns(bool);
    function getRole() public view virtual returns (bytes32);
    function changeRole(bytes32 initiatiorRole, bytes32 role, uint256 touchingPublicKey) public virtual returns (bytes32);
    function getMyPublicKey() public view virtual returns (uint256);
}

contract AccessCard {
    address accessControllerAddress;
    uint256 myPublicKey;
    TvmCell myInitState;
    // uint256 touched = 0;
    // address lastTouched;

    mapping(bytes32 => bool) public roles;
    bytes32 myRole;
    
    /*
     * Проверяет, что вызываемый текущим контрактом контракт имеет такой же init state
     */
    modifier isSameWallet(uint256 touchingPublicKey) {
        tvm.accept();
        TvmCell sendersStateInit = tvm.insertPubkey(myInitState, touchingPublicKey);
        require (msg.sender.value == tvm.hash(sendersStateInit)); // в msg.sender.value лежит вторая часть адреса отправителя
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
    modifier isAdminOrSuperadmin() {
        require(hasRole('ADMIN') || hasRole('SUPERADMIN'), 101, "Sender must be an admin or superadmin");
        tvm.accept();
        _;
    }

    /**
     * Checks that granting is correct
     */
    modifier isCorrectGranting(bytes32 initatorRole, bytes32 newRole) {
        if (initatorRole == 'ADMIN') {
            require(newRole == 'USER' || newRole == 'MODERATOR', 103, "Admin can not grant this role");
            require(hasRole('USER') || hasRole('MODERATOR'), 102, "Insuitable target role");
        } else // TODO можно объединить два условия выше в один require.
        if (initatorRole == 'SUPERADMIN') {
            // require(role == 'USER' || role == 'ADMIN', "Superadmin can not grant this role");
            require(hasRole('USER') || hasRole('ADMIN'), 102, "Insuitable target role");
        }
        tvm.accept();
        _;
    }

    constructor(address _accessControllerAddress, uint256 _myPublicKey, address _superAdminAddress, TvmCell _myInitState) public {
        tvm.accept();
        accessControllerAddress = _accessControllerAddress;
        myPublicKey = _myPublicKey;
        myInitState = _myInitState;
        roles['SUPERADMIN'] = true;
        roles['ADMIN'] = true;
        roles['MODERATOR'] = true;
        roles['USER'] = true;

        if (msg.sender == _superAdminAddress) { // TODO так можно?
            myRole = 'SUPERADMIN';
        } else {
            myRole = 'USER';
        }
    }

    /* function touchSome(IAccessCard target) external {
        tvm.accept();
        target.touchMe(myPublicKey);
    }

    function touchMe(uint256 touchingPublicKey) isSameWallet(touchingPublicKey) public virtual { //ПОЧЕМУ НЕ ВЫЗВАТЬ msg.pubkey() вместо передачи ключа?
        tvm.accept();
        lastTouched = msg.sender;
    }

    function info() public view returns (uint256, address) {
        tvm.accept();
        return (touched, lastTouched);
    } */

    /**
     * @dev Returns current role of this AccessCard
     */
    function getMyPublicKey() public view virtual returns (uint256) {
        tvm.accept();
        return myPublicKey;
    }

    // === Work with roles: ===

    /**
     * @dev Checks that role exists
     */
    function isRoleExists(bytes32 role) public view returns (bool) {
        tvm.accept();
        return roles[role];
    }

    /**
     * @dev Returns current role of this AccessCard
     */
    /* function getRole() public view virtual returns (bytes32) {
        tvm.accept();
        return myRole;
    } */

    /**
     * @dev Returns `true` if `target` has been granted `role`.
     */
    function hasRole(bytes32 role) public view virtual returns (bool) {
        tvm.accept();
        return myRole == role;
    }

    /**
     * @dev Grants `role` to `target`
     */
    function grantRole(bytes32 role, address targetAddress) acceptOnlyOwner() isAdminOrSuperadmin() /* isCorrectGranting(msg.sender, role, targetAddress) */ external {
        require(isRoleExists(role),  104, 'Incorrect role'); // TODO Может и в модификатор
        require(targetAddress != address(this),  105, "grantRole: Can not grant role for himself"); // TODO может не нужно, если есть external?
        tvm.accept();
        IAccessCard(targetAddress).changeRole(myRole, role, myPublicKey);
        if (role == 'SUPERADMIN') {
            myRole = 'USER';
            IAccessController(accessControllerAddress).changeAdmin(targetAddress, msg.sender); //TODO видимо так
        }
    }

    /**
     * Changes role for current AccessCard by another AccessCard
     */
    function changeRole(bytes32 initiatiorRole, bytes32 role, uint256 touchingPublicKey) isSameWallet(touchingPublicKey) /* isAdminOrSuperadmin(initiator) */ isCorrectGranting(initiatiorRole, role) public virtual {
        require(isRoleExists(role),  104, 'Incorrect role'); // TODO Может и в модификатор
        _changeRole(role);
    }

    /**
     * @dev Deactivate yourself
     * - superadmin can not to renounce role 
     */
    function deactivateHimself() public acceptOnlyOwner() {
        require(myRole != 'SUPERADMIN',  106, "Superadmin can not to deactivate himself");
        tvm.accept();
        myRole = 'USER';
    }

    /**
     * @dev Change role for yourself
     */
    function _changeRole(bytes32 role) private {
        require(isRoleExists(role),  104, 'Incorrect role');
        tvm.accept();
        myRole = role;
    }

}