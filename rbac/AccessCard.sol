pragma solidity >= 0.6.0;
/* import "./lib/BetterRequire.sol";
 */
interface IAccessController {
    function changeAdmin(address newSuperAdminAddress, address oldSuperAdminAddress, bytes32 /* previousTargetRole */) external;
}

interface IAccessCard {
    // function hasRole(bytes32 role) external view returns(bool);
    function changeRole(bytes32 initiatiorRole, bytes32 role, uint256 touchingPublicKey) external;
    function grantSuperAdmin() external;
}

contract AccessCard {
    address accessControllerAddress;
    address superAdminAddress;
    uint256 myPublicKey;
    TvmCell myInitState;

    bytes32 SUPERADMIN;
    bytes32 ADMIN;
    bytes32 MODERATOR;
    bytes32 USER;
    mapping(bytes32 => bool) public roles;
    bytes32 myRole;

    // debug variables
    bytes32 param_previousTargetRole_info;
    uint128 bounce;
    uint256 recievedPubKey;
    uint bounceCounter;

    // debug function
    function getInfo() public view returns (bytes32, uint128, uint, bytes32) {
        tvm.accept();
        return (param_previousTargetRole_info, bounce, bounceCounter, myRole);
    }
    // debug function
    function getInfoRole(bytes32 role) public view returns (bytes32, bytes32, bool, bool, bool, bool, bytes32) {
        tvm.accept();
        return (role, ADMIN, roles[role], roles[ADMIN], roles[SUPERADMIN], roles['ADMIN'], SUPERADMIN);
    }

    /*
     * Проверяет, что вызываемый текущим контрактом контракт имеет такой же init state
     */
    modifier isSameWallet(uint256 touchingPublicKey) {
        // tvm.accept();
        TvmCell sendersStateInit = tvm.insertPubkey(myInitState, touchingPublicKey);
        require(msg.sender.value == tvm.hash(sendersStateInit), 111); // в msg.sender.value лежит вторая часть адреса отправителя
        _;
    }

    /**
     * @dev Modifier that allows public function to accept external calls only from owner
     */
    modifier onlyOwner {
        require(tvm.pubkey() == msg.pubkey(), 108);
        _;
    }

    /**
     * @dev Checks that role exists
     */
    modifier isRoleExists(bytes32 role) {
        require(roles[role],  104); // 'Incorrect role'
        _;
    }


    constructor(address _accessControllerAddress, uint256 _myPublicKey, address _superAdminAddress, TvmCell _myInitState) public {
        tvm.accept();
        accessControllerAddress = _accessControllerAddress;
        superAdminAddress = _superAdminAddress;
        myPublicKey = _myPublicKey;
        myInitState = _myInitState;

        SUPERADMIN = 'SUPERADMIN';
        ADMIN = 'ADMIN';
        MODERATOR = 'MODERATOR';
        USER = 'USER';
        roles[SUPERADMIN] = true;
        roles[ADMIN] = true;
        roles[MODERATOR] = true;
        roles[USER] = true;

        myRole = USER;
    }

    // === Work with roles: ===

    /**
     * @dev Grant the first superadmin
     */
    function grantSuperAdmin() external {
        require (msg.sender == accessControllerAddress, 107);
        tvm.accept(); // TODO подумать
        myRole = 'SUPERADMIN';
    }

    /**
     * @dev Returns `true` if `target` has been granted `role`.
     */
    function getRole() public view returns (bytes32 my_role) {
        tvm.accept();
        return myRole;
    }

    /**
     * @dev Returns `true` if `target` has been granted `role`.
     */
    function hasRole(bytes32 role) public view returns (bool) {
        tvm.accept();
        return myRole == role;
    }

    /**
     * @dev Grants `role` to `target`
     */
    function grantRole(bytes32 role, address targetAddress) onlyOwner isRoleExists(role) public {
        require(hasRole(ADMIN) || hasRole(SUPERADMIN), 101, "Sender must be an admin or superadmin");
        require(targetAddress != address(this),  105, "grantRole: Can not grant role for himself"); // TODO может не нужно, если есть external?
        // require(myRole == SUPERADMIN || role != SUPERADMIN, 110, 'Only superadmin can grant superadmin role');
        tvm.accept();
        bytes32 calledByHavingRole = myRole; // my role at the time of the call
        if (role == SUPERADMIN) {
            calledByHavingRole = 'ADMIN';
            myRole = USER;
        }
        IAccessCard(targetAddress).changeRole{bounce:true}(calledByHavingRole, role, myPublicKey); 
    }

    /**
     * @dev Changes role for current AccessCard by another AccessCard
     */
    function changeRole(bytes32 initiatorRole, bytes32 role, uint256 touchingPublicKey) /* isSameWallet(touchingPublicKey) */ isRoleExists(role) external {
        tvm.accept();
        TvmCell sendersStateInit = tvm.insertPubkey(myInitState, touchingPublicKey);
        revert(115);
    //require(msg.sender.value == tvm.hash(sendersStateInit), 111); // в msg.sender.value лежит вторая часть адреса отправителя
        /* bounce = 36;//TODO del
        tvm.commit();//TODO de */
        if (initiatorRole == ADMIN) {
            require(role == USER || role == MODERATOR, 103); // "Admin can not grant this role"
            require(hasRole(USER) || hasRole(MODERATOR), 102); // "Insuitable target role"
        }
        _changeRole(role);
        if (role == SUPERADMIN) {
            IAccessController(accessControllerAddress).changeAdmin{bounce:true}(address(this), msg.sender, myRole); //TODO видимо так
        }
    }

    /**
     * @dev Deactivate yourself
     * - superadmin can not to renounce role 
     */
    function deactivateHimself() onlyOwner public {
        require(myRole != USER, 109, 'Already deactivated');
        require(myRole != SUPERADMIN,  106, "Superadmin can not to deactivate himself");
        tvm.accept();
        myRole = USER;
    }

    /**
     * @dev Change role for yourself
     */
    function _changeRole(bytes32 role) private { // isRoleExists здесь лишнее при условии, что роль проверяется в вызывающем методе
        tvm.accept(); // TODO вероятно лишнее - убрать
        myRole = role;
    }

    // Function onBounce is executed on inbound messages with set <bounced> flag. This function can not be called by
	// external/internal message
	// This function takes the body of the message as an argument.
	onBounce(TvmSlice slice) external {
        bounce = 66;
		// Increase the counter.
		bounceCounter++;
        
		// Start decoding the message. First 32 bits store the function id.
		uint32 functionId = slice.decode(uint32);

		// Api function tvm.functionId() allows to calculate function id by function name.
		if (functionId == tvm.functionId(IAccessCard.changeRole)) {}
            // TODO раскомментить код ниже
            /* bounce = 6;
			//Function decodeFunctionParams() allows to decode function parameters from the slice.
			// After decoding we store the arguments of the function in the state variables.
            bytes32 param_initiatiorRole;
            bytes32 param_role;
            uint256 param_touchingPublicKey;
			(param_initiatiorRole, param_role, param_touchingPublicKey) = slice.decodeFunctionParams(IAccessCard.changeRole);
            if (param_initiatiorRole == "SUPERADMIN" && param_role == "SUPERADMIN") {
                myRole = "SUPERADMIN";
            }
		} else if (functionId == tvm.functionId(IAccessController.changeAdmin)) {
            bounce = 7;
            address param_newSuperAdminAddress;
            address param_oldSuperAdminAddress;
            bytes32 param_previousTargetRole;
			(param_newSuperAdminAddress, param_oldSuperAdminAddress, param_previousTargetRole) = slice.decodeFunctionParams(IAccessController.changeAdmin);
            param_previousTargetRole_info = param_previousTargetRole;
            myRole = param_previousTargetRole;
		} */
	}
}