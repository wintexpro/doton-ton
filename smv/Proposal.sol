pragma solidity >= 0.6.0;

contract Proposal {
    TvmCell ballotInitState;
    uint256 publicKey;
    // Proposal info state
    uint8 static public chainId;
    uint64 static public nonce;
    bytes32 proposalData;
    uint256 votersAmount;
    address voteControllerAddress;

    // Proposal voting state
    mapping (uint8 => uint256) votes;
    mapping (address => uint8) addressVotes;

    constructor (
        TvmCell _ballotInitState,
        uint256 _publicKey,
        uint256 _votersAmount,
        address _voteControllerAddress,
        bytes32 _proposalData,
        uint8 initializerChoice,
        address initializerAddress
    ) public {
        tvm.accept();
        ballotInitState = _ballotInitState;
        publicKey = _publicKey;
        votersAmount = _votersAmount;
        voteControllerAddress = _voteControllerAddress;
        proposalData = _proposalData;
        votes[initializerChoice]++;
        addressVotes[initializerAddress] = initializerChoice;
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

    function vote(uint8 choice, uint256 ballotPublicKey) external isValidBallot(choice, ballotPublicKey) {
        votes[choice]++;
        addressVotes[msg.sender] = choice;
    }

    function voteByController(address voter, uint8 choice) external {
        require(msg.sender == voteControllerAddress);
        votes[choice]++;
        addressVotes[voter] = choice;
    }

 
}