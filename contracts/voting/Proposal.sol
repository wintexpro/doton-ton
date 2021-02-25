pragma ton-solidity ^0.36.0;

interface IHandler {
    function executeProposal(uint256 proposalPubKey, uint8 chainId, uint64 nonce, bytes32 messageType, TvmCell data) external;
}

contract Proposal {
    uint8 static chainId;
    uint64 static nonce;
    address static voteControllerAddress;
    TvmCell static data;

    // Proposal info state
    uint256 publicKey;
    uint256 votersAmount;
    
    // Proposal voting state
    mapping (uint8 => uint256) votes;
    mapping (address => uint8) addressVotes;

    uint8 error_wrong_sender    = 101;
    uint8 error_already_voted   = 102;

    constructor (
        uint256 _publicKey,
        uint256 _votersAmount,
        uint8 initializerChoice,
        address initializerAddress,
        address handlerAddress,
        bytes32 messageType
    ) public {
        tvm.accept();
        publicKey = _publicKey;
        votersAmount = _votersAmount;
        votes[initializerChoice]++;
        addressVotes[initializerAddress] = initializerChoice;
        if (_votersAmount == 1) {
            IHandler(handlerAddress).executeProposal{bounce:false, value:200000000}(tvm.pubkey(), chainId, nonce, messageType, data);
        }
    }

    function getYesVotes() public view returns (uint256 yesVotes) {
        return votes[1];
    }

    function getNoVotes() public view returns (uint256 noVotes) {
        return votes[0];
    }

    function voteByController(address voter, uint8 choice, bytes32 messageType, address handlerAddress) external {
        require(msg.sender == voteControllerAddress, error_wrong_sender);
        require(!addressVotes.exists(voter), error_already_voted);
        votes[choice]++;
        addressVotes[voter] = choice;
        if (votes[1] + votes[0] >= votersAmount) {
            IHandler(handlerAddress).executeProposal{bounce:false, value:200000000}(tvm.pubkey(), chainId, nonce, messageType, data);
        }
    }

 
}