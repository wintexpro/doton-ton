pragma solidity >= 0.6.0;

import "../smv/Proposal.sol";

contract Handler {
    TvmCell proposalCode;

    event ProposalExecuted(uint8 chainId, uint64 nonce, bytes32 messageType, bytes32 data);

    modifier isValidProposal(uint256 proposalPubKey, uint8 chainId, uint64 nonce) {
        // Solidity magic :)
        // We are don't care about constructor variables, because we don't want to deploy this contract...only address calculation
        address validCallingAddress = new Proposal {
            code: proposalCode, 
            value: 0,
            pubkey: proposalPubKey,
            varInit: {
                chainId: chainId,
                nonce: nonce
            }
        } (tvm.buildEmptyData(proposalPubKey), proposalPubKey, 0, address(0), 0, 0, address(0));
        require (msg.sender == validCallingAddress, 101);
        _;
    }

    constructor (TvmCell _proposalCode) public {
        tvm.accept();
        proposalCode = _proposalCode;
    }

    function executeProposal(uint256 proposalPubKey, uint8 chainId, uint64 nonce, bytes32 messageType, bytes32 data) isValidProposal(proposalPubKey, chainId, nonce) external {
        emit ProposalExecuted(chainId, nonce, messageType, data);
    }
}