pragma ton-solidity ^0.40.0;

import "./AbstractProposalHandler.sol";

contract Tip3Handler is AbstractProposalHandler {

    address tip3RootAddress;

    constructor (
        TvmCell _proposalCode,
        uint256 _epochControllerPubKey,
        address _tip3RootAddress
    ) AbstractProposalHandler (
        _proposalCode,
        _epochControllerPubKey
    ) public {
        tip3RootAddress = _tip3RootAddress;
    }

    function executeProposal(address epochAddress, uint8 chainId, uint64 nonce, bytes32 messageType, TvmCell data) isValidProposal(epochAddress, chainId, nonce, data) external view override {
        // TODO: variable for value?
        tip3RootAddress.transfer(100000000, false, 0, data);
    }
}