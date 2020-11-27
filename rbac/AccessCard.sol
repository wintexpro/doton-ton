pragma solidity >= 0.6.0;

interface IAccessController {
    function changeSuperAdmin(/* uint8 previousTargetRole,  */address newSuperAdminAddress, uint256 myPublicKey/* , address oldSuperAdminAddress */) external;
}

interface IAccessCard {
    //function rev(uint8 van, uint8 tu, uint256 fri) external;
    function changeRole(uint8 initiatiorRole, uint8 role, uint256 touchingPublicKey) external;
    function grantSuperAdmin() external;
}

contract AccessCard {
    address accessControllerAddress;
    address superAdminAddress;
    uint256 myPublicKey;
    TvmCell myInitState;

    uint8 constant SUPERADMIN = 1;
    uint8 constant ADMIN = 2;
    uint8 constant MODERATOR = 3;
    uint8 constant USER = 4;
    uint8 myRole;

    // debug variables
    uint128 bounce;
    uint bounceCounter;

    // debug function
    /* function rev(uint8 van, uint8 tu, uint256 fri) external {
        revert();
    } */

    // debug function
    function getInfo() public view returns (uint128, uint, uint8) {
        tvm.accept();
        return (bounce, bounceCounter, myRole);
    }

    /*
     * Проверяет, что вызываемый текущим контрактом контракт имеет такой же init state
     */
    modifier isSameWallet(uint256 touchingPublicKey) {
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
    modifier isRoleExists(uint8 role) {
        require(role == SUPERADMIN || role == ADMIN || role == MODERATOR || role == USER,  104, 'Incorrect role');
        _;
    }


    constructor(address _accessControllerAddress, uint256 _myPublicKey, address _superAdminAddress, TvmCell _myInitState) public {
        tvm.accept();
        accessControllerAddress = _accessControllerAddress;
        superAdminAddress = _superAdminAddress;
        myPublicKey = _myPublicKey;
        myInitState = _myInitState;
        myRole = USER;
    }

    // === Work with roles: ===

    /**
     * @dev Grant the first superadmin
     */
    function grantSuperAdmin() external {
        require (msg.sender == accessControllerAddress, 107);
        myRole = SUPERADMIN;
    }

    function getRole() public view returns (uint8 my_role) {
        tvm.accept();
        return myRole;
    }

    /**
     * @dev Grants `role` to `target`
     */
    function grantRole(uint8 role, address targetAddress) onlyOwner isRoleExists(role) public {
        require(myRole == ADMIN || myRole == SUPERADMIN, 101, "Sender must be an admin or superadmin");
        require(targetAddress != address(this),  105, "grantRole: Can not grant role for himself");
        require(myRole != ADMIN || (role != ADMIN && role != SUPERADMIN), 103, "Admin can not grant this role");
        tvm.accept();

        uint8 calledByHavingRole = myRole; // my role at the time of the call
        if (role == SUPERADMIN) {
            calledByHavingRole = ADMIN;
            myRole = USER;
        }
        IAccessCard(targetAddress).changeRole{bounce:true, value:200000000}(calledByHavingRole, role, myPublicKey); 
    }

    /**
     * @dev Changes role for current AccessCard by another AccessCard
     */
    function changeRole(uint8 initiatorRole, uint8 role, uint256 touchingPublicKey) isSameWallet(touchingPublicKey) external {
        require(initiatorRole != ADMIN || (myRole == USER || myRole == MODERATOR), 102, "Insuitable target role");
        myRole = role; // _changeRole(role);
        if (role == SUPERADMIN) {
            IAccessController(accessControllerAddress).changeSuperAdmin{bounce:true, value:20000000}(address(this), myPublicKey);
        }
    }

    /**
     * @dev Deactivate yourself
     */
    function deactivateHimself() onlyOwner public {
        require(myRole != USER, 109, 'Already deactivated');
        require(myRole != SUPERADMIN,  106, "Superadmin can not to deactivate himself");
        tvm.accept();
        myRole = USER;
    }

    // Function onBounce is executed on inbound messages with set <bounced> flag. This function can not be called by external/internal message
	// This function takes the body of the message as an argument.
	onBounce(TvmSlice slice) external {
		bounceCounter++; // Increase the counter.
        bounce = 66;
		// Start decoding the message. First 32 bits store the function id.
		uint32 functionId = slice.decode(uint32);
        if (functionId == tvm.functionId(IAccessCard.changeRole)) { // по идее в текущем коде нет кейсов, при которых требуется этот bounce
            uint8 param_initiatiorRole;
            uint8 param_role;
            (functionId, param_initiatiorRole, param_role) = slice.decode(uint32, uint8, uint8);
            if (param_initiatiorRole == SUPERADMIN && param_role == SUPERADMIN) {
                myRole = SUPERADMIN;
            }
        } /* else if (functionId == tvm.functionId(IAccessController.changeSuperAdmin)) {
            // нет кейсов, при которых changeSuperAdmin выкинет bounce, поскольку все входные данные собираются контрактом заведомо корректно
        } */
	}
}