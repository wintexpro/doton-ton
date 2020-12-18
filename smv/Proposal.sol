pragma solidity >= 0.6.0;

interface IHandler {
    function executeProposal(uint256 proposalPubKey, uint8 chainId, uint64 nonce, bytes32 messageType, bytes32 data) external;
}

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
        require(msg.sender == voteControllerAddress, 103);
        require(tvm.pubkey() != 0, 101);
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
        require(choice == 0 || choice == 1); // TODO: value check?
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

    function voteByController(address voter, uint8 choice, bytes32 messageType, address handlerAddress) external {
        require(msg.sender == voteControllerAddress);
        votes[choice]++;
        addressVotes[voter] = choice;
        if (votes[1] + votes[0] >= votersAmount) {
            IHandler(handlerAddress).executeProposal{bounce:false, value:200000000}(tvm.pubkey(), chainId, nonce, messageType, proposalData);
        }
    }

 
}