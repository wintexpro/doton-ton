pragma solidity >= 0.6.0;

contract Receiver {
    
    uint counter = 0;
    mapping (uint256 => bytes32) messages;

    function receiveData(bytes32 data) external {
        messages[counter] = data;
        counter++;
    }

    function getMessageByNumber(uint256 number) public returns(bytes32 message) {
        return messages[number];
    }
}