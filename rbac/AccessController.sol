pragma solidity >= 0.6.0;


import "./AccessCard.sol";
/* 
 * Контракт хранит код контракта AccessCard, деплоит в сеть контракты AccessCard.
 * Формально является мостом между вызывающим AccessCard и вызываемым
 */
contract AccessController {
    TvmCell accessCardInitState;
    uint128 initialValue; // количество токенов, которое необходимо отправить, чтобы задеплоить контракт AccesCard
    
    address superAdminAddress; // super-admin public key. Только один AccessCard может иметь роль super-admin.

    // Modifier that allows public function to accept external calls only from RelayNodeF.
    modifier acceptOnlyOwner {
        require(tvm.pubkey() == msg.pubkey(), 102, 'Only for owners');
        tvm.accept();
        _;
    }

    /*
     * Проверяет, что вызываемый текущим контрактом контракт имеет такой же init state, как и accessCardInitState
     */
    modifier isSameWallet(uint256 touchingPublicKey, address senderAddress) { //TODO ПОДУМАТЬ СТО РАЗ, ПРАВИЛЬНО ЛИ Я ДЕЛАЮ ПРОВЕРКУ?
        TvmCell sendersStateInit = tvm.insertPubkey(accessCardInitState, touchingPublicKey);
        require(senderAddress.value == tvm.hash(sendersStateInit), 111); // в msg.sender.value лежит вторая часть адреса отправителя
        _;
    }

    constructor (TvmCell _accessCardInitState, uint128 _initialValue/* , uint256 _myPublicKey */) public {
        tvm.accept();
        accessCardInitState = _accessCardInitState;
        initialValue = _initialValue; // TODO логику с этим полем
        superAdminAddress = address(this);
    }

    function getInitialValue() view external returns (uint128) {
        tvm.accept();
        return initialValue;
    }

    function updateInitialValue(uint128 newInitialValue) acceptOnlyOwner() external { // TODO непонятно, излишен ли acceptOnlyOwner в функциях external без public
        initialValue = newInitialValue;
    }

    /**
     * Grant the first superadmin
     */
    function grantSuperAdminRole(address accessCardAddress) acceptOnlyOwner() external {
        require(superAdminAddress == address(this), 101, 'Superadmin already created earler');
        tvm.accept();
		superAdminAddress = accessCardAddress; // address(tvm.hash(stateInitWithKey));
        IAccessCard(accessCardAddress).grantSuperAdmin();
    }

    function getSuperAdminAddress() view external returns (address) {
        tvm.accept();
        return superAdminAddress;
    }

    /**
     * Change the superadmin. Called by contract AccessCard
     */
    function changeSuperAdmin(address newSuperAdminAddress, uint256 targetPubKey) isSameWallet(targetPubKey, newSuperAdminAddress) external {
        // require(oldSuperAdminAddress == _address, 104); не должен попасть в этот кейс, поскольку все входные данные собираются контрактом заведомо корректно
        // require(tvm.pubkey() != msg.pubkey(), 103); // 'Only by another contracts'
        superAdminAddress = newSuperAdminAddress;
    }

    // создает хоть кто
    function deployAccessCardWithPubkey(uint256 pubkey) public returns (address deployedContract) {
        tvm.accept();
		TvmCell stateInitWithKey = tvm.insertPubkey(accessCardInitState, pubkey);
        address newAccessCard = new AccessCard{stateInit:stateInitWithKey, value:initialValue}(address(this), pubkey, superAdminAddress, accessCardInitState);
		return newAccessCard;
	}
}
