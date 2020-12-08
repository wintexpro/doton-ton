pragma solidity >= 0.6.0;

contract Receiver {
    
    mapping (uint256 => uint256) _nonce;

    event DataReceived(bytes32 data, uint256 destinationChainId, uint256 nonce);

    function receiveData(bytes32 data, uint256 destinationChainId) external {
        _nonce[destinationChainId]++;
        emit DataReceived(data, destinationChainId, _nonce[destinationChainId]);
    }

    function getNonceByChainId(uint256 destinationChainId) public returns(uint256 nonce) {
        return _nonce[destinationChainId];
    }
}