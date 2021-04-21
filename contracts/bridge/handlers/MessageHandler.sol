pragma ton-solidity ^0.40.0;

import "./AbstractProposalHandler.sol";

contract MessageHandler is AbstractProposalHandler {

    event ProposalExecuted(uint8 chainId, uint64 nonce, bytes32 messageType, bytes32 data);
    
    constructor (
        TvmCell _proposalCode,
        uint256 _epochControllerPubKey
    ) AbstractProposalHandler (
        _proposalCode,
        _epochControllerPubKey
    ) public {}

    function executeProposal(address epochAddress, uint8 chainId, uint64 nonce, bytes32 messageType, TvmCell data) isValidProposal(epochAddress, chainId, nonce, data) external view override {
        address(this).transfer(100000000, false, 0, data);
    }

    function receiveMessage(uint8 chainId, uint64 nonce, bytes32 messageType, bytes32 data) external pure {
        require (msg.sender.value == address(this).value, 111);
        emit ProposalExecuted(chainId, nonce, messageType, data);
    }
    
}