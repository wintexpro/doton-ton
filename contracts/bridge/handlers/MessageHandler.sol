pragma solidity >= 0.6.0;

import "./AbstractHandler.sol";

contract MessageHandler is AbstractHandler {

    event ProposalExecuted(uint8 chainId, uint64 nonce, bytes32 messageType, TvmCell data);
    
    constructor (
        TvmCell _proposalCode,
        address _bridgeVoteControllerAddress,
        uint256 _bridgeVoteControllerPubKey
    ) AbstractHandler (
        _proposalCode,
        _bridgeVoteControllerAddress,
        _bridgeVoteControllerPubKey
    ) public {}

    function executeProposal(uint256 proposalPubKey, uint8 chainId, uint64 nonce, bytes32 messageType, TvmCell data) isValidProposal(proposalPubKey, chainId, nonce, data) external view override {
        emit ProposalExecuted(chainId, nonce, messageType, data);
    }
}