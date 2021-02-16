pragma solidity >= 0.6.0;

import "./AbstractProposalHandler.sol";

contract MessageHandler is AbstractProposalHandler {

    event ProposalExecuted(uint8 chainId, uint64 nonce, bytes32 messageType, bytes32 data);
    
    constructor (
        TvmCell _proposalCode,
        address _bridgeVoteControllerAddress,
        uint256 _bridgeVoteControllerPubKey
    ) AbstractProposalHandler (
        _proposalCode,
        _bridgeVoteControllerAddress,
        _bridgeVoteControllerPubKey
    ) public {}

    function executeProposal(uint256 proposalPubKey, uint8 chainId, uint64 nonce, bytes32 messageType, TvmCell data) isValidProposal(proposalPubKey, chainId, nonce, data) external view override {
        address(this).transfer(100000000, false, 0, data);
    }

    function receiveMessage(uint8 chainId, uint64 nonce, bytes32 messageType, bytes32 data) external pure {
        require (msg.sender.value == address(this).value);
        emit ProposalExecuted(chainId, nonce, messageType, data);
    }
    
}