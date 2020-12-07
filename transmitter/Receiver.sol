pragma solidity >= 0.6.0;

contract Receiver {
    
    uint counter = 0;
    mapping (uint256 => bytes32) messages;

    event DataReceived(uint256 number, bytes32 data);

    function receiveData(bytes32 data) external {
        messages[counter] = data;
        emit DataReceived(counter, data);
        counter++;
    }

    function getMessageByNumber(uint256 number) public returns(bytes32 message) {
        return messages[number];
    }
}