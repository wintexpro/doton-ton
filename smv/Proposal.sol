pragma solidity >= 0.6.0;

contract Proposal {
    TvmCell ballotInitState;
    uint256 publicKey;
    // Proposal info state
    uint256 proposalId;
    uint256 votersAmount;

    // Proposal voting state
    mapping (uint8 => uint256) votes;

    constructor (TvmCell _ballotInitState, uint256 _publicKey, uint256 _proposalId, uint256 _votersAmount) public {
        tvm.accept();
        ballotInitState = _ballotInitState;
        publicKey = _publicKey;
        proposalId = _proposalId;
        votersAmount = _votersAmount;
    }

    modifier isValidBallot(uint8 choice, uint256 ballotPublicKey) {
        require(choice == 0 || choice == 1);
        tvm.accept();
        TvmCell ballotInitStateWithPublicKey = tvm.insertPubkey(ballotInitState, ballotPublicKey);
        require (msg.sender.value == tvm.hash(ballotInitStateWithPublicKey));
        _;
    }

    function getYesVotes() public view returns (uint256 yesVotes) {
        return votes[1];
    }

    function getNoVotes() public view returns (uint256 noVotes) {
        return votes[0];
    }

    // TODO or not internal?
    function vote(uint8 choice, uint256 ballotPublicKey) external isValidBallot(choice, ballotPublicKey) {
        votes[choice]++;
    }
 
}