pragma solidity >= 0.6.0;

import "../smv/Proposal.sol";

contract Handler {
    TvmCell proposalCode;
    address bridgeVoteControllerAddress;
    uint256 bridgeVoteControllerPubKey;

    event ProposalExecuted(uint8 chainId, uint64 nonce, bytes32 messageType, bytes32 data);

    modifier isValidProposal(uint256 proposalPubKey, uint8 chainId, uint64 nonce) {
        TvmCell proposalStateInit = tvm.buildStateInit({
            code: proposalCode,
            pubkey: bridgeVoteControllerPubKey,
            contr: Proposal,
            varInit: {
                chainId: chainId,
                nonce: nonce,
                voteControllerAddress: bridgeVoteControllerAddress
            }
        });
        require (msg.sender.value == tvm.hash(proposalStateInit), 101);
        _;
    }

    constructor (TvmCell _proposalCode, address _bridgeVoteControllerAddress, uint256 _bridgeVoteControllerPubKey) public {
        tvm.accept();
        proposalCode = _proposalCode;
        bridgeVoteControllerAddress = _bridgeVoteControllerAddress;
        bridgeVoteControllerPubKey = _bridgeVoteControllerPubKey;
    }

    function executeProposal(uint256 proposalPubKey, uint8 chainId, uint64 nonce, bytes32 messageType, bytes32 data) isValidProposal(proposalPubKey, chainId, nonce) external view {
        emit ProposalExecuted(chainId, nonce, messageType, data);
    }
}