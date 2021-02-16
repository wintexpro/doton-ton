pragma solidity >= 0.6.0;

import "./AbstractProposalHandler.sol";

contract Tip3Handler is AbstractProposalHandler {

    address tip3RootAddress;

    constructor (
        TvmCell _proposalCode,
        address _bridgeVoteControllerAddress,
        uint256 _bridgeVoteControllerPubKey,
        address _tip3RootAddress
    ) AbstractProposalHandler (
        _proposalCode,
        _bridgeVoteControllerAddress,
        _bridgeVoteControllerPubKey
    ) public {
        tip3RootAddress = _tip3RootAddress;
    }

    function executeProposal(uint256 proposalPubKey, uint8 chainId, uint64 nonce, bytes32 messageType, TvmCell data) isValidProposal(proposalPubKey, chainId, nonce, data) external view override {
        // TODO: variable for value?
        tip3RootAddress.transfer(100000000, false, 0, data);
    }
}