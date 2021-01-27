pragma solidity >= 0.6.0;

import "../../voting/Proposal.sol";

contract AbstractHandler {
    TvmCell proposalCode;
    address bridgeVoteControllerAddress;
    uint256 bridgeVoteControllerPubKey;

    modifier isValidProposal(uint256 proposalPubKey, uint8 chainId, uint64 nonce, TvmCell data) {
        TvmCell proposalStateInit = tvm.buildStateInit({
            code: proposalCode,
            pubkey: bridgeVoteControllerPubKey,
            contr: Proposal,
            varInit: {
                chainId: chainId,
                nonce: nonce,
                voteControllerAddress: bridgeVoteControllerAddress,
                data: data
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

    function executeProposal(uint256 proposalPubKey, uint8 chainId, uint64 nonce, bytes32 messageType, TvmCell data) isValidProposal(proposalPubKey, chainId, nonce, data) external view virtual {
        // should be overrided
    }
}