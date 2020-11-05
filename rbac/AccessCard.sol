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

    /**
     * @dev Checks that role exists
     */
    modifier isRoleExists(bytes32 role) {
        require(roles[role],  104, 'Incorrect role');
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
     * @dev Returns `true` if `target` has been granted `role`.
     */
    function hasRole(bytes32 role) public view virtual returns (bool) {
        tvm.accept();
        return myRole == role;
    }

    /**
     * @dev Grants `role` to `target`
     */
    function grantRole(bytes32 role, address targetAddress) acceptOnlyOwner() isAdminOrSuperadmin() isRoleExists(role) external {
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
    function changeRole(bytes32 initiatiorRole, bytes32 role, uint256 touchingPublicKey) isSameWallet(touchingPublicKey) isRoleExists(role) isCorrectGranting(initiatiorRole, role) public virtual {
        _changeRole(role);
    }

    /**
     * @dev Deactivate yourself
     * - superadmin can not to renounce role 
     */
    function deactivateHimself() acceptOnlyOwner() public {
        require(myRole != 'SUPERADMIN',  106, "Superadmin can not to deactivate himself");
        tvm.accept();
        myRole = 'USER';
    }

    /**
     * @dev Change role for yourself
     */
    function _changeRole(bytes32 role) isRoleExists(role)  private {
        tvm.accept();
        myRole = role;
    }

    // Function onBounce is executed on inbound messages with set <bounced> flag. This function can not be called by
	// external/internal message
	// This function takes the body of the message as an argument.
	onBounce(TvmSlice slice) external {
		// Increase the counter.
		// bounceCounter++;

		// Start decoding the message. First 32 bits store the function id.
		uint32 functionId = slice.decode(uint32);

		// Api function tvm.functionId() allows to calculate function id by function name.
		if (functionId == tvm.functionId(IAccessCard.changeRole)) {
			//Function decodeFunctionParams() allows to decode function parameters from the slice.
			// After decoding we store the arguments of the function in the state variables.
            bytes32 param_initiatiorRole;
            bytes32 param_role;
            uint256 param_touchingPublicKey;
			(param_initiatiorRole, param_role, param_touchingPublicKey) = slice.decodeFunctionParams(IAccessCard.changeRole);
            if (param_initiatiorRole == "SUPERADMIN" && param_role == "SUPERADMIN") {
                myRole = "SUPERADMIN";
            }
		} /* else if (functionId == tvm.functionId(AnotherContract.receiveValues)) {
			(invalidValue1, invalidValue2, invalidValue3) = slice.decodeFunctionParams(AnotherContract.receiveValues);
		} */
	}
}