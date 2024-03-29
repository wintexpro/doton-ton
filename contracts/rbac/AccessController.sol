pragma ton-solidity ^0.40.0;


import "./AccessCard.sol";
/* 
 * Контракт хранит код контракта AccessCard, деплоит в сеть контракты AccessCard.
 * Формально является мостом между вызывающим AccessCard и вызываемым
 */
contract AccessController {
    TvmCell accessCardInitState;
    uint128 initialValue; // количество токенов, которое необходимо отправить, чтобы задеплоить контракт AccessCard
    
    address superAdminAddress; // super-admin public key. Только один AccessCard может иметь роль superadmin.

    uint8 error_superadmin_already_created      = 101;
    uint8 error_is_not_my_owner                 = 102;
    uint8 error_invalid_wallet_init_state       = 111;

    // Modifier that allows public function to accept external calls only from RelayNodeF.
    modifier onlyOwner {
        require(tvm.pubkey() == msg.pubkey(), error_is_not_my_owner, 'Only for owners');
        _;
    }

    /*
     * Проверяет, что вызываемый текущим контрактом контракт имеет такой же init state, как и accessCardInitState
     */
    modifier isSameWallet(uint256 touchingPublicKey) {
        TvmCell sendersStateInit = tvm.insertPubkey(accessCardInitState, touchingPublicKey);
        require(msg.sender.value == tvm.hash(sendersStateInit), error_invalid_wallet_init_state); // в msg.sender.value лежит вторая часть адреса отправителя
        _;
    }

    constructor (TvmCell _accessCardInitState, uint128 _initialValue) public {
        tvm.accept();
        accessCardInitState = _accessCardInitState;
        initialValue = _initialValue;
        superAdminAddress = address(this);
    }

    function getInitialValue() view external returns (uint128) {
        return initialValue;
    }

    function updateInitialValue(uint128 newInitialValue) onlyOwner public { // TODO разобраться с external|internal|public|private для каждого метода
        tvm.accept();
        initialValue = newInitialValue;
    }

    /**
     * Grant the first superadmin
     */
    function grantSuperAdminRole(address accessCardAddress) onlyOwner external {
        require(superAdminAddress == address(this), error_superadmin_already_created, 'Superadmin already created earler');
        tvm.accept();
		superAdminAddress = accessCardAddress; // address(tvm.hash(stateInitWithKey));
        IAccessCard(accessCardAddress).grantSuperAdmin();
    }

    function getSuperAdminAddress() view external returns (address) {
        return superAdminAddress;
    }

    /**
     * Change the superadmin. Called by contract AccessCard
     */
    function changeSuperAdmin(address newSuperAdminAddress, uint256 touchingPublicKey) isSameWallet(touchingPublicKey) external {
        // require(oldSuperAdminAddress == _address, 104); не должен попасть в этот кейс, поскольку все входные данные собираются контрактом заведомо корректно
        superAdminAddress = newSuperAdminAddress;
    }
}
