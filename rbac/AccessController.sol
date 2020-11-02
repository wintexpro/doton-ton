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
    
    mapping (address => uint8) public members; // AccessCard address => roleId
    address adminAccessCard = 0x00; // адрес AccessCard с ролью admin. Только один AccessCard может иметь роль admin.

    constructor (TvmCell _accessCardInitState, uint128 _initialValue, uint256 _myPublicKey) public {
        tvm.accept();
        accessCardInitState = _accessCardInitState;
        initialValue = _initialValue;
        myPublicKey = _myPublicKey;
    }

    function deployAccessCardWithPubkey(uint256 pubkey, uint8 roleId) public returns (address deployedContract) {
        tvm.accept();
		TvmCell stateInitWithKey = tvm.insertPubkey(accessCardInitState, pubkey);
        bool isAdminRoleId = roleId == 1;
        if (isAdminRoleId) {
            require(adminAccessCard == 0x00);
        }
        address newAccessCard = new AccessCard{stateInit:stateInitWithKey, value:initialValue}(myPublicKey, pubkey, roleId, accessCardInitState);
        if (isAdminRoleId) {
            adminAccessCard = newAccessCard;
        }
        members[newAccessCard] = roleId;
		return newAccessCard;
	}
}
