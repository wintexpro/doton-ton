pragma solidity >= 0.6.0;

interface IReceiver {
    function receiveData(bytes32 data) external;
}

contract Sender {

    modifier onlyOwner {
        require(tvm.pubkey() == msg.pubkey(), 108);
        _;
    }

    function sendData(IReceiver destination, bool bounce, bytes32 data, uint128 value) external onlyOwner {
        tvm.accept();
        destination.receiveData{bounce:bounce, value:value}(data);
    } 
}