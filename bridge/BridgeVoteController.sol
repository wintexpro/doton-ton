pragma solidity >= 0.6.0;

import "../smv/VoteController.sol";

interface IProposal {
    function voteByController(address voter, uint8 choice) external;
}

contract BridgeVoteController is VoteController {

    address bridgeAddress;

    constructor (
        TvmCell _proposalInitState,
        TvmCell _ballotInitState,
        uint128 _deployInitialValue,
        uint256 _publicKey,
        uint256 _proposalPublicKey,
        uint256 _proposalVotersAmount,
        address _bridgeAddress
    ) VoteController (
        _proposalInitState,
        _ballotInitState,
        _deployInitialValue,
        _publicKey,
        _proposalPublicKey,
        _proposalVotersAmount
    ) public {
        bridgeAddress = _bridgeAddress;
    }

    function voteByBridge(address voter, uint8 choice, uint8 chainId, uint64 nonce, bytes32 data) external {
        require (msg.sender == bridgeAddress);
        require(choice == 0 || choice == 1);
        tvm.accept();
        if (proposals[chainId][nonce].value > 0) {
            IProposal(proposals[chainId][nonce]).voteByController{bounce:true, value:200000000}(voter, choice);
        } else {
            createProposal(chainId, nonce, data, choice, voter);
        }
    }
}