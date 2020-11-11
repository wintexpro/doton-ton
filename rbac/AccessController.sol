pragma solidity >= 0.6.0;

import "AccessCard.sol";

/* 
 * Контракт хранит код контракта AccessCard, деплоит в сеть контракты AccessCard.
 * Формально является мостом между вызывающим AccessCard и вызываемым
 */
contract AccessController {
    TvmCell accessCardInitState;
    uint128 initialValue; // количество токенов, которое необходимо отправить, чтобы задеплоить контракт AccesCard
    uint256 myPublicKey; // AccessController public key 
    
    address superAdminAddress; // super-admin public key. Только один AccessCard может иметь роль super-admin.

    modifier acceptOnlySuperAdmin(address _address) {
        require(superAdminAddress == _address);
        tvm.accept();
        _;
    }

    // Modifier that allows public function to accept external calls only from RelayNodeF.
    modifier acceptOnlyOwner {
        require(tvm.pubkey() == msg.pubkey());
        tvm.accept();
        _;
    }

    constructor (TvmCell _accessCardInitState, uint128 _initialValue/* , uint256 _myPublicKey */) public {
        tvm.accept();
        accessCardInitState = _accessCardInitState;
        initialValue = _initialValue; // TODO логику с этим полем
        myPublicKey = tvm.pubkey();//TODO зачем _myPublicKey, разве нельзя tvm.pubkey()?; // TODO теперь скорее всего не нужен
        superAdminAddress = address(this);
    }

    function getInfo() public view returns (uint128 info_initialValue, uint256 info_myPublicKey, address info_superAdminAddress) {
        tvm.accept();
        return (initialValue, myPublicKey, superAdminAddress);
    }

    function updateInitialValue(uint128 newInitialValue) acceptOnlyOwner() external {
        initialValue = newInitialValue;
    }

    /**
     * Grant the first superadmin
     */
    function grantSuperAdminRole(address accessCardAddress) acceptOnlyOwner() public {
        //TODO РАСКОММЕНТИТЬ require(superAdminAddress == address(this), 101, 'Superadmin already created earler');
        tvm.accept();
		superAdminAddress = accessCardAddress; // address(tvm.hash(stateInitWithKey));
        IAccessCard(accessCardAddress).grantSuperAdmin();
    }

    function changeAdmin(address newSuperAdminAddress, address oldSuperAdminAddress) acceptOnlySuperAdmin(oldSuperAdminAddress) external virtual {
        tvm.accept();
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
