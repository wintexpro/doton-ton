pragma ton-solidity ^0.40.0;

import "../../voting/Proposal.sol";

contract AbstractProposalHandler {
    TvmCell proposalCode;
    uint256 epochControllerPubKey;

    uint8 error_invalid_proposal = 101;

    modifier isValidProposal(address epochAddress, uint8 chainId, uint64 nonce, TvmCell data) {
        TvmCell proposalStateInit = tvm.buildStateInit({
            code: proposalCode,
            pubkey: epochControllerPubKey,
            contr: Proposal,
            varInit: {
                chainId: chainId,
                nonce: nonce,
                voteControllerAddress: epochAddress,
                data: data
            }
        });
        require (msg.sender.value == tvm.hash(proposalStateInit), error_invalid_proposal);
        _;
    }

    constructor (TvmCell _proposalCode, uint256 _epochControllerPubKey) public {
        tvm.accept();
        proposalCode = _proposalCode;
        epochControllerPubKey = _epochControllerPubKey;
    }

    function executeProposal(address epochAddress, uint8 chainId, uint64 nonce, bytes32 messageType, TvmCell data) isValidProposal(epochAddress, chainId, nonce, data) external view virtual {
        // should be overrided
    }
}