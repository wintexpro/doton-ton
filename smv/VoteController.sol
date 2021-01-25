pragma solidity >= 0.6.0;

import "./Proposal.sol";

contract VoteController {

    // Controller basic state
    TvmCell proposalCode;
    TvmCell ballotInitState;
    uint256 publicKey;
    uint128 deployInitialValue;
    uint256 proposalPublicKey;

    // Proposal state
    uint256 proposalVotersAmount;

    constructor (
        TvmCell _proposalCode,
        TvmCell _ballotInitState,
        uint128 _deployInitialValue,
        uint256 _publicKey,
        uint256 _proposalPublicKey,
        uint256 _proposalVotersAmount
    ) public {
        tvm.accept();
        proposalCode = _proposalCode;
        ballotInitState = _ballotInitState;
        deployInitialValue = _deployInitialValue;
        publicKey = _publicKey;
        proposalPublicKey = _proposalPublicKey;
        proposalVotersAmount = _proposalVotersAmount;
    }

    modifier onlyOwner {
        require (msg.pubkey() == publicKey);
        _;
    }
    
    function createProposal(
        uint8 chainId,
        uint64 nonce,
        bytes32 data,
        uint8 initializerChoice,
        address initializerAddress,
        address handlerAddress,
        bytes32 messageType
    ) public returns (address proposalAddress) {
        tvm.accept();
        proposalAddress = new Proposal {
            code: proposalCode, 
            value: deployInitialValue,
            pubkey: tvm.pubkey(),
            varInit: {
                chainId: chainId,
                nonce: nonce,
                voteControllerAddress: address(this)
            }
        } (
            ballotInitState,
            proposalPublicKey,
            proposalVotersAmount,
            data,
            initializerChoice,
            initializerAddress,
            handlerAddress,
            messageType
        );
        return proposalAddress;
    }

    function getDeployInitialValue() public view returns (uint128) {
        return deployInitialValue;
    }

    function setDeployInitialValue(uint128 _deployInitialValue) public onlyOwner returns (uint128) {
        tvm.accept();
        deployInitialValue = _deployInitialValue;
        return deployInitialValue;
    }

    function getBallotCode() public view returns (TvmCell ballotCode) {
        return ballotInitState;
    }

    function getProposalAddress(uint8 chainId, uint64 nonce) public view returns (address proposal) {
        TvmCell proposalStateInit = tvm.buildStateInit({
            code: proposalCode,
            pubkey: tvm.pubkey(),
            contr: Proposal,
            varInit: {
                chainId: chainId,
                nonce: nonce,
                voteControllerAddress: address(this)
            }
        });
        return address(tvm.hash(proposalStateInit));
    }
}