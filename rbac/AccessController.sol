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
    
    // mapping (address => uint8) public members; // AccessCard address => roleId
    address superAdminPublicKey = 0x00; // super-admin public key. Только один AccessCard может иметь роль super-admin.

    modifier acceptOnlySuperAdminPublicKey(oldSuperAdminPublicKey) {
        require(oldSuperAdminPublicKey == superAdminPublicKey);
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
        myPublicKey = _myPublicKey;
    }

    /**
     * grantSuperAdminRole
     */
    function grantSuperAdminRole(uint256 futureSuperAdminPublicKey) acceptOnlyOwner public {
        require(adminPublicKey == 0x00);
        superAdminPublicKey = futureSuperAdminPublicKey;
        deployAccessCardWithPubkey(futureSuperAdminPublicKey, 'ADMIN'); // деплоим админу AccessCard c ролью admin
    }

    // TODO нужен метод (здесь или внутри AccessCard, или доработка метода выше), чтобы переназначить роль super-admin-а
    function changeAdmin(uint newSuperAdminPublicKey, uint oldSuperAdminPublicKey) acceptOnlySuperAdminPublicKey(oldSuperAdminPublicKey) public {
        superAdminPublicKey = newSuperAdminPublicKey;
    }

    // админ создает
    function deployAccessCardWithPubkey(uint256 pubkey, uint8 role) public returns (address deployedContract) {
        require (role != 'ADMIN', 'To grant admin role use other method');
        tvm.accept();
		TvmCell stateInitWithKey = tvm.insertPubkey(accessCardInitState, pubkey);
        require (role == 'RELAYER'); // TODO здесь адекватную проверку, что roleId корректен
        address newAccessCard = new AccessCard{stateInit:stateInitWithKey, value:initialValue}(myPublicKey, pubkey, role, accessCardInitState);
		return newAccessCard;
	}
}
