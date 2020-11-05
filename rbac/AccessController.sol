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

    constructor (TvmCell _accessCardInitState, uint128 _initialValue, uint256 _myPublicKey) public {
        tvm.accept();
        accessCardInitState = _accessCardInitState;
        initialValue = _initialValue;
        myPublicKey = _myPublicKey; // TODO теперь скорее всего не нужен
        // делаем владельца суперадмином:
        superAdminAddress = msg.sender;
        deployAccessCardWithPubkey(_myPublicKey); // деплоим админу AccessCard c ролью admin
    }

    /**
     * grantSuperAdminRole
     */
    /* function grantSuperAdminRole(uint256 futureSuperAdminPublicKey) acceptOnlyOwner() public {
        // require(superAdminAddress); TODO проверить
        superAdminAddress = msg.sender;
        deployAccessCardWithPubkey(futureSuperAdminPublicKey); // деплоим админу AccessCard c ролью admin
    } */

    function changeAdmin(address newSuperAdminAddress, address oldSuperAdminAddress) acceptOnlySuperAdmin(oldSuperAdminAddress) external virtual {
        /* TvmCell sendersStateInit = tvm.insertPubkey(myInitState, touchingPublicKey); короч тут надо проверить, что метод вызван из AccessCard
        require (msg.sender.value == tvm.hash(sendersStateInit)); */
        superAdminAddress = newSuperAdminAddress;
    }

    // создает хоть кто
    function deployAccessCardWithPubkey(uint256 pubkey) public returns (address deployedContract) {
        // require (role != 'ADMIN', 'To grant admin role use other method');
        tvm.accept();
		TvmCell stateInitWithKey = tvm.insertPubkey(accessCardInitState, pubkey);
        address newAccessCard = new AccessCard{stateInit:stateInitWithKey, value:initialValue}(address(this), pubkey, msg.sender, accessCardInitState);
		return newAccessCard;
	}
}
