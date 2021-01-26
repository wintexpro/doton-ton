pragma solidity >= 0.6.0;

interface IReceiver {
    function receiveData(bytes32 data, uint256 destinationChainId) external;
}

contract Sender {

    modifier onlyOwner {
        require(tvm.pubkey() == msg.pubkey(), 108);
        _;
    }

    function sendData(IReceiver destination, bool bounce, uint128 value, bytes32 data, uint256 destinationChainId) external onlyOwner {
        tvm.accept();
        destination.receiveData{bounce:bounce, value:value}(data, destinationChainId);
    } 
}