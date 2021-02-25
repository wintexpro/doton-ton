pragma ton-solidity ^0.36.0;

interface IAccessController {
    function changeSuperAdmin(address newSuperAdminAddress, uint256 myPublicKey) external;
}

interface IAccessCard {
    function changeRole(uint8 initiatiorRole, uint8 role, uint256 touchingPublicKey) external;
    function grantSuperAdmin() external;
}

contract AccessCard {
    address accessControllerAddress;
    uint256 myPublicKey;
    TvmCell myInitState;

    uint8 constant SUPERADMIN = 1;
    uint8 constant ADMIN = 2;
    uint8 constant MODERATOR = 3;
    uint8 constant USER = 4;
    uint8 myRole;

    uint128 valueForChangeRole;
    uint128 valueForChangeSuperAdmin;

    uint8 error_sender_must_be_an_admin_or_superadmin       = 101;
    uint8 error_unsuitable_target_role                      = 102;
    uint8 error_admin_can_not_grant_this_role               = 103;
    uint8 error_incorrect_role                              = 104;
    uint8 error_can_not_grant_role_for_himself              = 105;
    uint8 error_superadmin_can_not_to_deactivate_himself    = 106;
    uint8 error_sender_is_not_superadmin                    = 107;
    uint8 error_is_not_my_owner                             = 108;
    uint8 error_already_deactivated                         = 109;
    uint8 error_invalid_wallet_init_state                   = 111;

    /*
     * Проверяет, что вызываемый текущим контрактом контракт имеет такой же init state
     */
    modifier isSameWallet(uint256 touchingPublicKey) {
        TvmCell sendersStateInit = tvm.insertPubkey(myInitState, touchingPublicKey);
        require(msg.sender.value == tvm.hash(sendersStateInit), error_invalid_wallet_init_state); // в msg.sender.value лежит вторая часть адреса отправителя
        _;
    }

    /**
     * @dev Modifier that allows public function to accept external calls only from owner
     */
    modifier onlyOwner {
        require(tvm.pubkey() == msg.pubkey(), error_is_not_my_owner);
        _;
    }

    /**
     * @dev Checks that role exists
     */
    modifier isRoleExists(uint8 role) {
        require(role == SUPERADMIN || role == ADMIN || role == MODERATOR || role == USER,  error_incorrect_role, 'Incorrect role');
        _;
    }


    constructor(address _accessControllerAddress, uint256 _myPublicKey, TvmCell _myInitState) public {
        tvm.accept();
        accessControllerAddress = _accessControllerAddress;
        myPublicKey = _myPublicKey;
        myInitState = _myInitState;
        myRole = USER;
        valueForChangeRole = 200000000;
        valueForChangeSuperAdmin =  20000000;
    }

    // === Work with values that need for sending the messages to other contracts: ===
    
    function updateValueForChangeRole(uint128 newValue) onlyOwner public {
        tvm.accept();
        valueForChangeRole = newValue;
    }

    function getValueForChangeRole() public view returns (uint128) {
        return valueForChangeRole;
    }

    function updateValueForChangeSuperAdmin(uint128 newValue) onlyOwner public {
        tvm.accept();
        valueForChangeSuperAdmin = newValue;
    }

    function getValueForChangeSuperAdmin() public view returns (uint128) {
        return valueForChangeSuperAdmin;
    }

    // === Work with roles: ===

    /**
     * @dev Grant the first superadmin
     */
    function grantSuperAdmin() external {
        require (msg.sender == accessControllerAddress, error_sender_is_not_superadmin);
        myRole = SUPERADMIN;
    }

    function getRole() public view returns (uint8 my_role) {
        return myRole;
    }

    /**
     * @dev Grants `role` to `target`
     */
    function grantRole(uint8 role, address targetAddress) onlyOwner isRoleExists(role) public {
        require(myRole == ADMIN || myRole == SUPERADMIN, error_sender_must_be_an_admin_or_superadmin, "Sender must be an admin or superadmin");
        require(targetAddress != address(this), error_can_not_grant_role_for_himself, "grantRole: Can not grant role for himself");
        require(myRole != ADMIN || (role != ADMIN && role != SUPERADMIN), error_admin_can_not_grant_this_role, "Admin can not grant this role");
        tvm.accept();

        uint8 calledByHavingRole = myRole; // my role at the time of the call
        if (role == SUPERADMIN) {
            calledByHavingRole = ADMIN;
            myRole = USER;
        }
        IAccessCard(targetAddress).changeRole{bounce:true, value: valueForChangeRole}(calledByHavingRole, role, myPublicKey); 
    }

    /**
     * @dev Changes role for current AccessCard by another AccessCard
     */
    function changeRole(uint8 initiatorRole, uint8 role, uint256 touchingPublicKey) isSameWallet(touchingPublicKey) external {
        require(initiatorRole != ADMIN || (myRole == USER || myRole == MODERATOR), error_unsuitable_target_role, "Unsuitable target role");
        myRole = role;
        if (role == SUPERADMIN) {
            IAccessController(accessControllerAddress).changeSuperAdmin{bounce:true, value:valueForChangeSuperAdmin}(address(this), myPublicKey);
        }
    }

    /**
     * @dev Deactivate yourself
     */
    function deactivateHimself() onlyOwner public {
        require(myRole != USER, error_already_deactivated, 'Already deactivated');
        require(myRole != SUPERADMIN,  error_superadmin_can_not_to_deactivate_himself, "Superadmin can not to deactivate himself");
        tvm.accept();
        myRole = USER;
    }

    // Function onBounce is executed on inbound messages with set <bounced> flag. This function can not be called by external/internal message
	// This function takes the body of the message as an argument.
	onBounce(TvmSlice slice) external {
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