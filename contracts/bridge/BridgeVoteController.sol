pragma ton-solidity ^0.36.0;

import "../voting/VoteController.sol";

interface IProposal {
    function voteByController(address voter, uint8 choice, bytes32 messageType, address handlerAddress) external;
}

contract BridgeVoteController is VoteController {

    address bridgeAddress;

    uint8 error_wrong_sender      = 111;
    uint8 error_invalid_choice    = 112;

    constructor (
        TvmCell _proposalCode,
        uint128 _deployInitialValue,
        uint256 _publicKey,
        uint256 _proposalPublicKey,
        uint256 _proposalVotersAmount,
        address _bridgeAddress
    ) VoteController (
        _proposalCode,
        _deployInitialValue,
        _publicKey,
        _proposalPublicKey,
        _proposalVotersAmount
    ) public {
        bridgeAddress = _bridgeAddress;
    }

    function voteByBridge(address voter, uint8 choice, uint8 chainId, bytes32 messageType, address handlerAddress, uint64 nonce, TvmCell data) external {
        require (msg.sender == bridgeAddress, error_wrong_sender);
        require(choice == 0 || choice == 1, error_invalid_choice);
        tvm.accept();
        // 2 calls (1 with error, 1 is ok)
        createProposal(chainId, nonce, data, choice, voter, handlerAddress, messageType);
        IProposal(getProposalAddress(chainId, nonce, data)).voteByController{bounce:true, value:300000000}(voter, choice, messageType, handlerAddress);
    }
}