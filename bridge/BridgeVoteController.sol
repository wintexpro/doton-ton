pragma solidity >= 0.6.0;

import "../smv/VoteController.sol";

interface IProposal {
    function voteByController(address voter, uint8 choice, bytes32 messageType, address handlerAddress) external;
}

contract BridgeVoteController is VoteController {

    address bridgeAddress;

    constructor (
        TvmCell _proposalCode,
        TvmCell _ballotInitState,
        uint128 _deployInitialValue,
        uint256 _publicKey,
        uint256 _proposalPublicKey,
        uint256 _proposalVotersAmount,
        address _bridgeAddress
    ) VoteController (
        _proposalCode,
        _ballotInitState,
        _deployInitialValue,
        _publicKey,
        _proposalPublicKey,
        _proposalVotersAmount
    ) public {
        bridgeAddress = _bridgeAddress;
    }

    function voteByBridge(address voter, uint8 choice, uint8 chainId, bytes32 messageType, address handlerAddress, uint64 nonce, bytes32 data) external {
        require (msg.sender == bridgeAddress);
        require(choice == 0 || choice == 1);
        tvm.accept();
        // 2 calls (1 with error, 1 is ok)
        createProposal(chainId, nonce, data, choice, voter, handlerAddress, messageType);
        IProposal(getProposalAddress(chainId, nonce)).voteByController{bounce:true, value:300000000}(voter, choice, messageType, handlerAddress);
    }
}