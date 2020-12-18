pragma solidity >= 0.6.0;

contract Handler {
    TvmCell proposalCode;

    event ProposalExecuted(uint8 chainId, uint64 nonce, bytes32 messageType, bytes32 data);

    contract (TvmCell _proposalCode) public {
        tvm.accept();
        proposalCode = _proposalCode;
    }

    // TODO check if called by proposal
    function executeProposal(uint8 chainId, uint64 nonce, bytes32 messageType, bytes32 data) external {
        emit ProposalExecuted(chainId, nonce, messageType, data);
    }
}