pragma solidity >= 0.6.0;

interface IProposal {
    function vote(uint8 choice, uint256 ballotPublicKey) external;
}
/** Ballot with invalid ABI (for tests) */
contract Ballot {
    bool isUsed = false;
    address usedFor;
    bool fieldThatNotExistsInOriginalBallot = true;

    function vote(uint8 choice, IProposal proposal) external {
        require(choice == 0 || choice == 1);
        require(!isUsed);
        tvm.accept();
        isUsed = true;
        usedFor = proposal;
        proposal.vote(choice, tvm.pubkey());
    }

    function getInfo() public view returns (bool, address) {
        return (isUsed, usedFor);
    }

    onBounce(TvmSlice slice) external {
        uint32 functionId = slice.decode(uint32);
        if (functionId == tvm.functionId(IProposal.vote)) {
            isUsed = false;
            usedFor = address(0);
        }
    }
}